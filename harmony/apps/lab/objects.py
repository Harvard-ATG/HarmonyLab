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
    def __init__(self, *args, **kwargs):
        self.course_id = kwargs.get('course_id', None)
        self.groups = []
        self.exercises = []

    def getGroupList(self):
        raise Exception("subclass responsibility")

    def findGroup(self, group):
        raise Exception("subclass responsibility")

    def findExercise(self, exercise):
        raise Exception("subclass responsibility")

    def findExerciseByGroup(self, group, exercise):
        raise Exception("subclass responsibility")

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
    BASE_PATH = os.path.join(settings.ROOT_DIR, 'data', 'exercises', 'json')

    def __init__(self, *args, **kwargs):
        super(ExerciseFileRepository, self).__init__(*args, **kwargs)
        self.findFiles()

    @staticmethod
    def getBasePath(course_id):
        if course_id is None:
            return os.path.join(ExerciseFileRepository.BASE_PATH, "all")
        return os.path.join(ExerciseFileRepository.BASE_PATH, "course", course_id)

    def getGroupList(self):
        '''Returns a list of group names.'''
        path_to_exercises = ExerciseFileRepository.getBasePath(self.course_id)
        groups = []
        for root, dirs, files in os.walk(path_to_exercises):
            group_name = string.replace(root, path_to_exercises, '')
            groups.append(ExerciseGroup(group_name, course_id=self.course_id))
        return sorted([{
            "name": g.name,
            "url": g.url()} for g in groups if len(g.name) > 0
        ], key=lambda g:g['name'].lower())

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
        self.reset()

        path_to_exercises = ExerciseFileRepository.getBasePath(self.course_id)

        for root, dirs, files in os.walk(path_to_exercises):
            group_name = string.replace(root, path_to_exercises, '')
            exercise_group = ExerciseGroup(group_name, course_id=self.course_id)
            exercises = []  

            sorted_files = sorted(files, key=lambda e: e.lower())
            for file_name in sorted_files:
                if file_name.endswith('.json'):
                    exercise_file = ExerciseFile(file_name, exercise_group, root)
                    exercises.append(exercise_file)

            if len(exercises) > 0:
                exercise_group.add(exercises)
                self.groups.append(exercise_group)
                self.exercises.extend(exercises)
    
    def createExercise(self, data):
        exercise = Exercise(data)
        group_name = data.pop('group_name', None)
        result = {}
        if exercise.isValid():
            ef = ExerciseFile.create(course_id=self.course_id, group_name=group_name, exercise=exercise)
            result['status'] = "success"
            result['message'] = "Exercise created successfully!"
            result['data'] = {"exercise": exercise.getData(), "url": ef.url()}
        else:
            result['status'] = "error"
            result['message'] = "Exercise failed to save."
            result['errors'] = exercise.errors
        return result

class Exercise:
    def __init__(self, data, meta=None):
        self.data = {}
        self.errors = []
        self.is_valid = True

        self.data.update(data)
        
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
        return self

    def isValid(self):
        return self.is_valid

    def getData(self):
        return self.data

    def asJSON(self):
        return json.dumps(self.getData(), sort_keys=True, indent=4, separators=(',', ': '))

    @classmethod
    def fromJSON(cls, data):
        return cls(json.loads(data))

class ExerciseLilyPondError(Exception):
    pass

class ExerciseLilyPond:
    def __init__(self, lilypondString, *args, **kwargs):
        self.lpstring = lilypondString
        self.errors = []
        self.is_valid = True
        self.midi = self.parse()

    def parseChords(self, lpstring):
        chords = re.findall('<([^>]+)>', lpstring.strip())
        # re.findall('<([^>]+)>', "<e c' g' bf'>1\n<f \xNote c' \xNote f' a'>1")
        return chords
    
    def parseChord(self, chordstring, start_octave=4):
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
        chordstring = chordstring.lower() # normalize to lower case

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
        return self.is_valid
    
    def toMIDI(self):
        return self.midi

class ExerciseFileError(Exception):
    pass

class ExerciseFile:
    def __init__(self, file_name, group, group_path):
        self.file_name = file_name
        self.group_path = group_path
        self.name = file_name.replace('.json', '')
        self.group = group
        self.exercise = None
        self.selected = False
        
    def getPathToFile(self, ):
        return os.path.join(self.group_path, self.file_name)
    
    def load(self):
        try:
            with open(self.getPathToFile()) as f:
                data = f.read().strip()
                self.exercise = Exercise.fromJSON(data) 
        except IOError as e:
            raise ExerciseFileError("Error loading exercise file: {0} => {1}".format(e.errno, e.strerror))
        return True

    def save(self):
        if self.exercise is None:
            raise ExerciseFileError("No exercise attached to file.")

        if not self.exercise.isValid():
            return False

        try:
            if not os.path.exists(self.group_path):
                os.makedirs(self.group_path)
            with open(self.getPathToFile(), 'w') as f:
                f.write(self.exercise.asJSON())
        except IOError as e:
            raise ExerciseFileError("Error loading exercise file: {0} => {1}".format(e.errno, e.strerror))

        return True

    def next(self):
        return self.group.next(self)

    def nextUrl(self):
        if self.next():
            return self.next().url()
        return None

    def previousUrl(self):
        if self.previous():
            return self.previous().url()
        return None

    def previous(self):
        return self.group.previous(self)

    def url(self):
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

    def asJSON(self):
        return json.dumps(self.asDict())

    def asDict(self):
        d = {}
        if self.exercise is not None:
            d.update(self.exercise.getData())
        d.update({
            "id": os.path.join(self.group.name, self.name),
            "name": self.name, 
            "url": self.url(),
            "group_name": self.group.name,
            "selected": self.selected,
        })
        return d

    def __str__(self):
        return self.group.name + '::' + self.name

    def __repr__(self):
        return self.__str__()

    @staticmethod
    def getNextFileName(group_path, group_size):
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
        course_id = kwargs.get("course_id", None)
        group_name = kwargs.get('group_name', None)
        file_name = kwargs.get('file_name', None)
        exercise = kwargs.get("exercise", None)
        
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
        ef.exercise = exercise
        ef.save()
        log.info("Created exercise. Course: %s Group: %s File: %s Path: %s" % (course_id, group_path, file_name, ef.getPathToFile()))

        return ef

class ExerciseGroup:
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
