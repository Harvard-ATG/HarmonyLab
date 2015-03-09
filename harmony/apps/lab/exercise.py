from django.core.urlresolvers import reverse
import os.path
import json

class ExerciseError(Exception):
    pass

class Exercise:
    def __init__(self):
        self.file = None
        self.data = None
        self.json_data = None
        self.loaded = False

        base_path = os.path.dirname(os.path.realpath(__file__))
        self.exercise_base_path = os.path.join(base_path, 'exercises', 'json')

    def getExerciseFilePath(self, exercise_id):
        '''Returns the full path to the exercise file.'''
        exercise_path = exercise_id.split('/')
        return os.path.join(self.exercise_base_path, *exercise_path) + ".json"

    def getExerciseFileDir(self, exercise_id):
        '''Returns the full path to the exercise file's directory.'''
        exercise_path = exercise_id.split('/')
        return os.path.split(os.path.join(self.exercise_base_path, *exercise_path))[0]

    def load(self, exercise_id):
        '''Loads the exercise file data and determines the exercise in the sequence.'''
        if self.loaded:
            return self

        exercise_file = self.getExerciseFilePath(exercise_id)
        try:
            with open(exercise_file) as f:
                data = f.read()
                self.data = json.loads(data)
        except IOError as e:
            raise ExerciseError("Error loading exercise. I/O error({0}): {1}".format(e.errno, e.strerror))


        next_exercise = self.getNextExercise(exercise_id)
        if next_exercise:
            self.data['nextExercise'] = reverse('lab:exercise', kwargs={"exercise_id":next_exercise})
        else:
            self.data['nextExercise'] = ''

        return self

    def getNextExercise(self, exercise_id):
        '''
        Returns a string that is the ID of the next exercise in the sequence, 
        or None if it's the last exercise.

        Notes: 
            - The order of exercises is determined by an alpha-numeric sort (case-insensitive).
            - If an exercise is nested in a directory, the next exercise will be from that directory listing.
        '''

        exercise_head, exercise_tail = os.path.split(exercise_id) 
        exercise_list = os.listdir(self.getExerciseFileDir(exercise_id))
        exercise_list = [
            os.path.join(exercise_head, e.replace('.json', '')) 
            for e in sorted(exercise_list, key=lambda e: e.lower())
        ]

        next_index = -1
        for index, exercise in enumerate(exercise_list):
            if exercise_id == exercise:
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
