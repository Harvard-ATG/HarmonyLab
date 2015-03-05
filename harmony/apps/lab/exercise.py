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

    def getExerciseFile(self, exercise_id):
        exercise_path = exercise_id.split('/')
        return os.path.join(self.exercise_base_path, *exercise_path) + ".json"

    def getExercisePath(self, exercise_id):
        exercise_path = exercise_id.split('/')
        return os.path.split(os.path.join(self.exercise_base_path, *exercise_path))[0]

    def load(self, exercise_id):
        if self.loaded:
            return self

        exercise_file = self.getExerciseFile(exercise_id)
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
        '''Returns the next exercise after the given exercise ID, or None.'''

        exercise_path = self.getExercisePath(exercise_id)
        exercise_list = os.listdir(exercise_path)
        print exercise_path, exercise_list
        sorted_exercise_list = sorted(exercise_list, key=lambda e: e.lower())

        next_index = -1
        for index, item in enumerate(sorted_exercise_list):
            item = item.replace('.json', '')
            if exercise_id == item:
                next_index = index + 1
                break

        next_exercise = None
        if next_index >= 0 and next_index < len(exercise_list):
            next_exercise = exercise_list[next_index].replace('.json', '')

        return next_exercise

    def as_json(self, pretty=False):
        if pretty:
            return json.dumps(self.data, indent=4, separators=(',', ': '), sort_keys=True)
        return json.dumps(self.data)
