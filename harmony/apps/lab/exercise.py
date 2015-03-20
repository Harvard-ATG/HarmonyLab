from django.core.urlresolvers import reverse
import os.path
import json

class ExerciseError(Exception):
    pass

class Exercise:
    BASE_PATH = os.path.dirname(os.path.realpath(__file__))
    
    def __init__(self, exercise_id):
        self.file = None
        self.data = None
        self.loaded = False
        self.exercise_base_path = os.path.join(Exercise.BASE_PATH, 'exercises', 'json')
        self.exercise_id = exercise_id

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


        next_exercise = self.getNextExercise()
        if next_exercise is None:
            self.data['nextExercise'] = ''
        else:
            self.data['nextExercise'] = self.getExerciseUrl(next_exercise['id'])
            
        exercise_list = self.getExerciseList()
        if exercise_list is None:
            self.data['exerciseList'] = ''
        else:
            self.data['exerciseList'] = exercise_list

        return self
    
    def getExerciseUrl(self, exercise_id):
        '''Returns the URL for the exercise.'''
        return reverse('lab:exercise', kwargs={"exercise_id":exercise_id})  
 
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
        return [{
            "name":name,
            "id": os.path.join(head, name),
            "parent": head,
            "url": self.getExerciseUrl(os.path.join(head, name))
        } for name in sorted_exercise_list]
    
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

    def getNextExercise(self):
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
                next_index = index + 1
                break

        next_exercise = None
        if next_index >= 0 and next_index < len(exercise_list):
            next_exercise = exercise_list[next_index]

        return next_exercise

    def as_json(self, pretty=False):
        '''Returns the exercise data as a JSON string.'''
        if pretty:
            return json.dumps(self.data, indent=4, separators=(',', ': '), sort_keys=True)
        return json.dumps(self.data)

    def as_dict(self):
        '''Returns the exercise data as a python dict.'''
        return self.data
