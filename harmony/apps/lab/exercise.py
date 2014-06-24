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

    def load(self, exercise_id):
        if self.loaded:
            return self

        path = os.path.dirname(os.path.realpath(__file__))
        exercise_file = os.path.join(path, "exercises", "exercise-{0}.json".format(exercise_id))

        try:
            with open(exercise_file) as f:
                data = f.read()
                self.data = json.loads(data)
        except IOError as e:
            raise ExerciseError("Error loading exercise. I/O error({0}): {1}".format(e.errno, e.strerror))

        return self

    def as_json(self):
        return json.dumps(self.data, indent=4, separators=(',', ': '), sort_keys=True)
