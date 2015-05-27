from django.conf import settings
from django.core.urlresolvers import reverse
import os
import os.path
import string
import json
import re
import logging

log = logging.getLogger(__name__)

class ExerciseRepository(object):
    '''
    This is an abstract interface for accessing exercises. All interaction with
    exercises should originate from this class, so that if the storage mechanism
    is changed later, client code impact can be minimized. 

    To get an instance of the repository, use the create() factory method. If
    the repositoryType keyword argument is not present, the default will be
    returned, which is currently "file". It's best not to pass a specific
    repository type and just use the default, so that it's easy to move to a
    database backend later.

    Usage: 
        repo = ExerciseRepository.create()
        exercise = repo.findExerciseByGroup("MyGroupName", "03")
    '''
    def __init__(self, *args, **kwargs):
        self.course_id = kwargs.get('course_id', None)
        if self.course_id is not None:
            self.course_id = str(self.course_id)
        self.groups = []
        self.exercises = []

    def getGroupList(self):
        raise Exception("subclass responsibility")

    def findGroup(self, group_name):
        raise Exception("subclass responsibility")

    def findExercise(self, exercise_name):
        raise Exception("subclass responsibility")

    def findExerciseByGroup(self, group_name, exercise_name):
        raise Exception("subclass responsibility")

    def createExercise(self, data):
        raise Exception("subclass responsibility")

    def updateExercise(self, group_name, exercise_name, data):
        raise Exception("subclass responsibility")

    def deleteExercise(self, group_name, exercise_name):
        raise Exception("subclass responsibility")

    def deleteGroup(self, group_name):
        raise Exception("subclass responsibility")
    
    def getGroupAtIndex(self, index):
        if index >= 0 and index < len(self.groups):
            return self.groups[index]
        return None

    def reset(self):
        self.exercises = []
        self.groups = []

    def asDict(self):
        return {
            "course_id": self.course_id,
            "data": {
                "exercises": [e.asDict() for e in self.exercises],
                "groups": [g.asDict() for g in self.groups]
            }
        }

    def asJSON(self):
        return json.dumps(self.asDict())
        
    def __str__(self):
        return ', '.join([str(e) for e in self.exercises])

    def __repr__(self):
        return self.__str__()
    
    @staticmethod
    def create(*args, **kwargs):
        repositories = {"file": ExerciseFileRepository}
        repositoryType = kwargs.pop('repositoryType', "file")
        if not (repositoryType in repositories):
            raise "Invalid repository type"
        return repositories[repositoryType](*args, **kwargs)
    

class ExerciseFileRepository(ExerciseRepository):
    '''
    Implements the ExerciseRepository interface using files and directories to
    store exercises.
    '''
    BASE_PATH = os.path.join(settings.ROOT_DIR, 'data', 'exercises', 'json')

    def __init__(self, *args, **kwargs):
        '''
        Initializes the object by searching the directory tree for all exercises
        and groups so that method calls already have the data they need to
        operate.

        Assumptions:
        * Groups are directories.
        * Exercises are files in those directories.
        * Every exercise belongs to a group.
        * Exercise file data is not loaded (client must do that). 
        '''
        super(ExerciseFileRepository, self).__init__(*args, **kwargs)
        self.findFiles()

    @staticmethod
    def getBasePath(course_id):
        '''
        Returns the file path to exercises for a given course, or if no course,
        defaults to a catch-all directory.
        '''
        if course_id is None:
            return os.path.join(ExerciseFileRepository.BASE_PATH, "all")
        return os.path.join(ExerciseFileRepository.BASE_PATH, "courses", course_id)

    def getGroupList(self):
        '''Returns a list of group names.'''
        return sorted([{
            "name": g.name,
            "url": g.url(),
            "size": g.size(),
        } for g in self.groups if len(g.name) > 0], key=lambda g:g['name'].lower())           

    def findGroup(self, group_name):
        '''Returns a single group (group names should be distinct).'''
        for g in self.groups:
            if group_name == g.name:
                return g
        return None

    def findExercise(self, exercise_name):
        '''Returns an array of exercise matches (exercise names are not distinct).'''
        result = []
        for e in self.exercises:
            if exercise_name == e.name:
                result.append(e)
        return result

    def findExerciseByGroup(self, group_name, exercise_name):
        '''Returns a single exercise (group+exercise is unique).'''
        group = self.findGroup(group_name)
        if group is not None:
            return group.findExercise(exercise_name)
        return None

    def findFiles(self):
        '''
        Traverses the directory tree looking for all directories (groups) and
        files (exercises) and instantiates objects for each.
        '''
        self.reset()

        path_to_exercises = ExerciseFileRepository.getBasePath(self.course_id)

        for root, dirs, files in os.walk(path_to_exercises):
            group_name = string.replace(root, path_to_exercises, '')
            exercise_group = ExerciseGroup(group_name, course_id=self.course_id)
            exercise_files = []  

            sorted_files = sorted(files, key=lambda e: e.lower())
            for file_name in sorted_files:
                if file_name.endswith('.json'):
                    exercise_file = ExerciseFile(file_name, exercise_group, root)
                    exercise_files.append(exercise_file)

            if len(exercise_files) > 0:
                exercise_group.add(exercise_files)
                self.groups.append(exercise_group)
                self.exercises.extend(exercise_files)

    def createExercise(self, data):
        '''
        Stores an exercise in a group folder with the given data, assuming it is
        valid.
        '''
        group_name = data.pop('group_name', None)
        exercise_definition = ExerciseDefinition(data)
        result = {}
        if exercise_definition.isValid():
            ef = ExerciseFile.create(
                course_id=self.course_id,
                group_name=group_name,
                exercise_definition=exercise_definition)
            result['status'] = "success"
            result['message'] = "Exercise created successfully!"
            result['data'] = {"exercise": exercise_definition.getData(), "url": ef.url()}
        else:
            result['status'] = "error"
            result['message'] = "Exercise failed to save."
            result['errors'] = exercise_definition.getErrors()
        return result
    
    def deleteExercise(self, group_name, exercise_name):
        '''
        Deletes an exercise file in a group.
        '''
        exercise = self.findExerciseByGroup(group_name, exercise_name)
        if exercise is not None:
            try:
                exercise.delete()
            except OSError as e:
                return (False, str(e))
        return (True, "Deleted exercise %s of group %s" % (exercise_name, group_name))

    def deleteGroup(self, group_name):
        '''
        Deletes a group folder, including all exercise files in the folder.
        '''
        group = self.findGroup(group_name)
        if group is not None:
            try:
                group.delete()
            except OSError as e:
                return (False, str(e))
        return (True, "Deleted exercise group %s" % (group_name))

class ExerciseDefinition:
    '''
    An ExerciseDefinition is a stateless object that describes an exercise
    problem such that it can be presented to a student as intended by an
    instructor.

    The object's main responsibility is to ensure that the definition is valid
    and convert to/from different data formats.

    Although the application primarily speaks MIDI, the definition collaborates
    with ExerciseLilyPond so that a user can provide a chord sequence using a
    subset of LilyPond's notation (http://lilypond.org).
    '''
    def __init__(self, data):
        self.errors = []
        self.is_valid = True
        self.data = data
        self.processData()
        
    def processData(self):
        if not "type" in self.data:
            self.data['type'] = "matching"

        if "lilypond_chords" in self.data:
            self.lilypond = ExerciseLilyPond(self.data['lilypond_chords'])
            if self.lilypond.isValid():
                self.data['chord'] = self.lilypond.toMIDI()
            else:
                self.is_valid = False
                self.errors.extend(list(self.lilypond.errors))

    def isValid(self):
        return self.is_valid

    def getData(self):
        return self.data

    def getErrors(self):
        return self.errors

    def asJSON(self):
        return json.dumps(self.getData(), sort_keys=True, indent=4, separators=(',', ': '))

    @classmethod
    def fromJSON(cls, data):
        return cls(json.loads(data))

class ExerciseLilyPondError(Exception):
    pass

class ExerciseLilyPond:
    '''
    This object parses a string that is assumed to be a chord sequence in
    LilyPond notation (http://www.lilypond.org/). The output is a data structure
    with MIDI note numbers that is valid for ExerciseDefinition.

    Here are the key points for subset of LilyPond that can be parsed:

    * Absolute octave entry.
    * A pitch name is specified using lowercase letters a through g. 
      The note names c to b are engraved in the octave below middle C.
    * Other octaves may be specified with a single quote (') or comma (,) character. 
      Each ' raises the pitch by one octave; each , lowers the pitch by an octave.
    * A sharp pitch is made by adding "s" to the note name. A flat pitch is made 
      by adding "f" to the note name.
    * A chord is a sequence of pitches enclosed in angle brackets (e.g. &lt;c e g&gt;). 
      A minimum of one chord must be entered.
    * Notes can be "hidden" by prefixing the pitch with an "x" or (e.g. &lt;c xe xg&gt;).

    See also:

    http://www.lilypond.org/doc/v2.18/Documentation/notation/writing-pitches
    '''
    def __init__(self, lilypondString, *args, **kwargs):
        self.lpstring = lilypondString
        self.errors = []
        self.is_valid = True
        self.midi = self.parse()

    def parseChords(self, lpstring):
        '''Parses the string into chords.'''
        chords = re.findall('<([^>]+)>', lpstring.strip())
        # re.findall('<([^>]+)>', "<e c' g' bf'>1\n<f \xNote c' \xNote f' a'>1")
        return chords
    
    def parseChord(self, chordstring, start_octave=4):
        '''
        Parses a single chord string into a set of MIDI "visible" and "hidden" notes.
        '''
        # NOTE:
        # http://www.lilypond.org/doc/v2.18/Documentation/notation/writing-pitches
        # parsing notes in "absolute" octave mode - each note must be specified absolutely

        # constants for parsing
        note_tuples = [('c',0),('d',2),('e',4),('f',5),('g',7),('a',9),('b',11)]
        notes = [n[0] for n in note_tuples]
        note_pitch = dict(note_tuples)
        up, down = ("'", ",")
        sharp, flat = ("s", "f")
        hidden_note_symbol = r"x"

        # normalize the chord string 
        chordstring = re.sub(r'\\xNote\s*', hidden_note_symbol, chordstring) # replace '\xNote' with just 'x'
        chordstring = chordstring.lower().strip() # normalize to lower case

        # mutable variables used during parsing
        midi_chord = {"visible": [], "hidden": []}
        
        # parse each pitch entry in the chord and translate to MIDI
        pitch_entries = re.split('\s+', chordstring)
        for idx, pitch_entry in enumerate(pitch_entries):
            octave = start_octave
            tokens = list(pitch_entry) # convert entry to sequence of characters

            # check if this is a "hidden" note
            midi_entry = midi_chord['visible']
            if tokens[0] == hidden_note_symbol:
                midi_entry = midi_chord['hidden']
                tokens = tokens[1:]

            # check if the first character is a valid note name,
            # otherwise record an error and skip the rest of the parsing
            if len(tokens) == 0 or not (tokens[0] in notes):
                self.is_valid = False
                self.errors.append("Pitch [%s] in chord [%s] is invalid: missing or invalid note name" % (pitch_entry, chordstring))
                raise ExerciseLilyPondError("Error parsing LilyPond chord: %s" % chordstring)
            
            note_name = tokens[0]
            tokens = tokens[1:]
            
            # check that all subsequent characters are either octave changing marks, or accidentals
            check_rest = re.sub('|'.join([up,down,sharp,flat,'\d']), '', ''.join(tokens))
            if len(check_rest) > 0:
                self.is_valid = False
                self.errors.append("Pitch entry [%s] in chord [%s] contains unrecognized symbols: %s" % (pitch_entry, chordstring, check_rest))
                raise ExerciseLilyPondError("Error parsing LilyPond chord: %s" % chordstring)

            # look for octave changing marks
            octave_change = 0
            octaves = re.findall('('+up+'|'+down+'|\d)', ''.join(tokens))
            if octaves is not None:
                for o in octaves:
                    if o == up:
                        octave_change += 1
                    elif o == down:
                        octave_change -= 1
                    else:
                        octave = int(o)
            
            # look for change in the pitch by accidentals
            pitch_change = 0  
            accidentals = re.findall('('+sharp+'|'+flat+')', ''.join(tokens))
            if accidentals is not None:
                for acc in accidentals:
                    if acc == sharp:
                        pitch_change += 1
                    elif acc == flat:
                        pitch_change -= 1

            # calculate the midi note number and add to the midi entry
            octave += octave_change
            midi_pitch = (octave * 12) + note_pitch[note_name] + pitch_change
            midi_entry.append(midi_pitch)

        return midi_chord

    def parse(self):
        '''
        Parse method that parses the LilyPond string into an array
        of MIDI chords.
        '''
        octave = 4
        midi_chords = []
        try:
            for chordstring in self.parseChords(self.lpstring):
                midi_chord = self.parseChord(chordstring, octave)
                midi_chords.append(midi_chord)
        except ExerciseLilyPondError as e:
            return []
        return midi_chords
  
    def isValid(self):
        '''
        Returns true if it's valid notation that is understood by the parser.
        '''
        return self.is_valid
    
    def toMIDI(self):
        '''
        Returns the parsed MIDi data.
        '''
        return self.midi

class ExerciseFileError(Exception):
    pass

class ExerciseFile:
    '''
    ExerciseFile is responsible for knowing how to load() and save()
    ExerciseDefinition objects to the file system. 
    '''
    def __init__(self, file_name, group, group_path):
        self.file_name = file_name
        self.group_path = group_path
        self.name = file_name.replace('.json', '')
        self.group = group
        self.exerciseDefinition = None
        self.selected = False
        
    def getPathToFile(self, ):
        return os.path.join(self.group_path, self.file_name)
    
    def load(self):
        '''Loads an ExerciseDefinition from a file.'''
        try:
            with open(self.getPathToFile()) as f:
                data = f.read().strip()
                self.exerciseDefinition = ExerciseDefinition.fromJSON(data) 
        except IOError as e:
            raise ExerciseFileError("Error loading exercise file: {0} => {1}".format(e.errno, e.strerror))
        return True

    def save(self, exercise_definition):
        '''Saves an ExerciseDefinition to a file.'''
        if exercise_definition is not None:
            self.exerciseDefinition = exercise_definition
        elif self.exerciseDefinition is None:
            raise ExerciseFileError("No exercise definition to save.")

        if not self.exerciseDefinition.isValid():
            return False

        try:
            if not os.path.exists(self.group_path):
                os.makedirs(self.group_path)
            with open(self.getPathToFile(), 'w') as f:
                f.write(self.exerciseDefinition.asJSON())
        except IOError as e:
            raise ExerciseFileError("Error loading exercise file: {0} => {1}".format(e.errno, e.strerror))

        return True
    
    def delete(self):
        '''Deletes an exercise file.'''
        if not os.path.exists(self.getPathToFile()):
            return False
        os.remove(self.getPathToFile())
        try:
            os.rmdir(self.group_path)
            log.info("Removed group directory because it was empty: %s" % self.group_path)
        except OSError:
            pass
        return True

    def next(self):
        '''Returns the next exercise file in the group.'''
        return self.group.next(self)

    def nextUrl(self):
        '''Returns the URL to the next exercise in the group.'''
        if self.next():
            return self.next().url()
        return None

    def previousUrl(self):
        '''Returns the URL to the previous exercise in the group.'''
        if self.previous():
            return self.previous().url()
        return None

    def previous(self):
        '''Returns the previous exercise file in the group.'''
        return self.group.previous(self)

    def url(self):
        '''Returns the URL to the exercise.'''
        if self.group.course_id is None:
            return reverse('lab:exercises', kwargs={
                "group_name": self.group.name, 
                "exercise_name": self.name
            })
        return reverse('lab:course-exercises', kwargs={
                "course_id": self.group.course_id,
                "group_name": self.group.name, 
                "exercise_name": self.name           
        })
    
    def getName(self):
        '''Returns the name of the exercise file.'''
        return self.name
    
    def getGroupName(self):
        '''Returns the group name.'''
        return self.group.name
    
    def getID(self):
        '''Returns the ID of the exercise file, that is, the path to the
        file.'''
        return os.path.join(self.group.name, self.name)
    
    def setExerciseDefinition(exercise_definition=None):
        '''Sets the ExerciseDefinition (if there isn't one already.'''
        self.exerciseDefinition = exercise_definition

    def asJSON(self):
        '''Returns the exercise as JSON.'''
        return json.dumps(self.asDict())

    def asDict(self):
        '''Returns the exercise as Dict.'''
        d = {}
        if self.exerciseDefinition is not None:
            d.update(self.exerciseDefinition.getData())
        d.update({
            "id": self.getID(),
            "name": self.name,
            "url": self.url(),
            "group_name": self.group.name,
            "selected": self.selected,
        })
        return d

    def __str__(self):
        return self.getID()

    def __repr__(self):
        return self.__str__()

    @staticmethod
    def getNextFileName(group_path, group_size):
        '''Generates the next file name for the group (numbers 01,02...99).'''
        max_tries = 99
        n = group_size + 1
        file_name = "%s.json" % str(n).zfill(2)

        while os.path.exists(os.path.join(group_path, file_name)):
            n += 1
            if n > max_tries:
                raise Exception("unable to get next exercise file name after %d tries" % max_tries)
            file_name = "%s.json" % str(n).zfill(2)

        return file_name
    
    @staticmethod
    def create(**kwargs):
        '''Creates an exercise file.'''
        course_id = kwargs.get("course_id", None)
        group_name = kwargs.get('group_name', None)
        file_name = kwargs.get('file_name', None)
        exercise_definition = kwargs.get("exercise_definition", None)
        
        er = ExerciseFileRepository(course_id=course_id)
        group = er.findGroup(group_name)
        if group is None:
            group_name = re.sub(r'[^a-zA-Z0-9._\-]', r'', group_name) # scrub group name
            group = ExerciseGroup(group_name, course_id=course_id)

        group_size = group.size()
        group_path = os.path.join(ExerciseFileRepository.getBasePath(course_id), group_name)

        if file_name is None:
            file_name = ExerciseFile.getNextFileName(group_path, group_size)
        
        ef = ExerciseFile(file_name, group, group_path)
        ef.save(exercise_definition)
        log.info("Created exercise. Course: %s Group: %s File: %s Path: %s" % (course_id, group_path, file_name, ef.getPathToFile()))

        return ef

class ExerciseGroup:
    '''
    Exercises belong to groups, so this object is a container
    for exercises that knows how to manipulate and traverse
    sets of exercises.
    '''
    def __init__(self, group_name, *args, **kwargs):
        self.name = group_name
        self.course_id = kwargs.get("course_id", None)
        if self.name.startswith('/'):
            self.name = self.name[1:]
        self.exercises = []
        
    def size(self):
        return len(self.exercises)    

    def add(self, exercises):
        self.exercises.extend(exercises)
        return self
    
    def delete(self):
        for exercise in self.exercises:
            exercise.delete()

    def url(self):
        if self.course_id is None:
            return reverse('lab:exercise-groups', kwargs={"group_name": self.name})
        return reverse('lab:course-exercise-groups', kwargs={"group_name": self.name, "course_id": self.course_id})

    def first(self):
        if len(self.exercises) > 0:
            return self.exercises[0]
        return None

    def last(self):
        if len(self.exercises) > 0:
            return self.exercises[-1]
        return None

    def next(self, exercise):
        if exercise in self.exercises:
            index = self.exercises.index(exercise)
            if index < len(self.exercises) - 1:
                return self.exercises[index + 1]
        return None

    def previous(self, exercise):
        if exercise in self.exercises:
            index = self.exercises.index(exercise)
            if index > 0:
                return self.exercises[index - 1]
        return None

    def findExercise(self, exercise_name):
        for e in self.exercises:
            if exercise_name == e.name:
                return e
        return None

    def getList(self):
        exercise_list = []
        for e in self.exercises:
            d = e.asDict()
            exercise_list.append({
                "id": d['id'],
                "name": d['name'], 
                "url": d['url'],
                "selected": d['selected']
            })
        return exercise_list

    def asJSON(self):
        return json.dumps(self.asDict())

    def asDict(self):
        return {
            "name": self.name,
            "url": self.url(),
            "data": {
                "exercises": [e.asDict() for e in self.exercises]
            }
        }

    def __str__(self):
        return '[' + ', '.join([str(e) for e in self.exercises]) + ']'

    def __repr__(self):
        return self.__str__()
