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

        path = os.path.dirname(os.path.realpath(__file__))
        self.exercise_path = os.path.join(path, 'exercises', 'json')

    def load(self, exercise_id):
        if self.loaded:
            return self

        exercise_file = os.path.join(self.exercise_path, "{0}.json".format(exercise_id))
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
        next_index = -1
        exercise_list = os.listdir(self.exercise_path)
        exercise_list = sorted(exercise_list, key=str.lower)
        for index, item in enumerate(exercise_list):
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
