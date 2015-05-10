from django.core.urlresolvers import reverse
from django.conf import settings
import os.path
import json

class ExerciseError(Exception):
    pass

class Exercise:
    BASE_PATH = os.path.join(settings.ROOT_DIR, 'data', 'exercises')
    
    def __init__(self, exercise_id):
        self.file = None
        self.data = {}
        self.loaded = False
        self.exercise_base_path = os.path.join(Exercise.BASE_PATH, 'json')
        self.exercise_id = exercise_id

        is_dir_without_trailing_slash = not self.exerciseIsFile() and not self.endsWithSlash(self.exercise_id)
        if is_dir_without_trailing_slash:
            self.exercise_id = '%s/' % self.exercise_id

        self.exercise_list = self.getExerciseList()

        if self.endsWithSlash(self.exercise_id): 
            if len(self.exercise_list) > 0:
                self.exercise_id = self.exercise_list[0]['id']

    def load(self):
        '''Loads the exercise file data and determines the exercise in the sequence.'''
        if self.loaded:
            return self

        exercise_file = self.getExerciseFilePath()
        try:
            with open(exercise_file) as f:
                data = f.read().strip()
                self.data = json.loads(data)
        except IOError as e:
            raise ExerciseError("Error loading exercise. I/O error({0}): {1}".format(e.errno, e.strerror))

        self.data['nextExercise'] = self.getExerciseUrlFor('next')
        self.data['previousExercise'] = self.getExerciseUrlFor('previous')
        self.data['exerciseList'] = self.exercise_list

        return self

    def getExerciseFilePath(self):
        '''Returns the full path to the exercise file.'''
        exercise_path = self.exercise_id.split('/')
        return os.path.join(self.exercise_base_path, *exercise_path) + ".json"

    def getExerciseFileDir(self):
        '''Returns the full path to the exercise file's directory.'''
        exercise_path = self.exercise_id.split('/')
        return os.path.split(os.path.join(self.exercise_base_path, *exercise_path))[0]
   
    def getExerciseList(self):
        '''Returns the list of exercises.'''
        head, tail = os.path.split(self.exercise_id)
        exercise_list = os.listdir(self.getExerciseFileDir())
        filtered_exercise_list = [e.replace('.json', '') for e in exercise_list if e.endswith(".json")]
        sorted_exercise_list = sorted(filtered_exercise_list, key=lambda e: e.lower())

        self.exercise_list = [{
            "id": os.path.join(head, name),
            "name":name,
            "parent": head,
            "url": self.getExerciseUrl(os.path.join(head, name)),
            "selected": os.path.join(head, name) == self.exercise_id,
        } for name in sorted_exercise_list]

        return self.exercise_list
    
    def getFirstExercise(self):
        '''Returns the first exercise, or None.'''
        exercise_list = self.getExerciseList()
        if len(exercise_list) == 0:
            return None
        return exercise_list[0]
    
    def getLastExercise(self):
        '''Returns the last exercise, or None.'''
        exercise_list = self.getExerciseList()
        if len(exercise_list) == 0:
            return None
        return exercise_list[-1]       

    def getNextExercise(self, direction=1):
        '''
        Returns a string that is the ID of the next exercise in the sequence, 
        or None if it's the last exercise.

        Notes: 
            - The order of exercises is determined by an alpha-numeric sort (case-insensitive).
            - If an exercise is nested in a directory, the next exercise will be from that directory listing.
        '''

        exercise_list = self.getExerciseList()

        next_index = -1
        for index, exercise in enumerate(exercise_list):
            if self.exercise_id == exercise['id']:
                next_index = index + direction 
                break

        next_exercise = None
        if next_index >= 0 and next_index < len(exercise_list):
            next_exercise = exercise_list[next_index]

        return next_exercise

    def getExerciseUrlFor(self, which):
        '''Returns the URL of the next exercise.'''
        exercise = None
        if which == 'next':
            exercise = self.getNextExercise(1)
        if which == 'previous':
            exercise = self.getNextExercise(-1)
        elif which == 'first':
            exercise = self.getFirstExercise()
        elif which == 'last':
            exercise = self.getLastExercise()
        if exercise is None:
            return ''
        return self.getExerciseUrl(exercise['id'])
    
    def getExerciseUrl(self, exercise_id):
        '''Returns the URL for the exercise.'''
        return reverse('lab:exercise', kwargs={"exercise_id":exercise_id})  

    def endsWithSlash(self, item):
        '''Returns true if the item ends with a forward slash.'''
        return item.split('/')[-1] == ''

    def exerciseIsFile(self):
        '''Returns true if the exercise id is a file.'''
        return os.path.isfile(self.getExerciseFilePath())

    def as_json(self, pretty=False):
        '''Returns the exercise data as a JSON string.'''
        if pretty:
            return json.dumps(self.data, indent=4, separators=(',', ': '), sort_keys=True)
        return json.dumps(self.data)

    def as_dict(self):
        '''Returns the exercise data as a python dict.'''
        return self.data
