from django.conf import settings
from django.core.urlresolvers import reverse
import os
import os.path
import string
import json

class ExerciseFileError(Exception):
    pass

class ExerciseRepository:
    BASE_PATH = os.path.join(settings.ROOT_DIR, 'data', 'exercises', 'json')

    def __init__(self, course_name=None):
        self.course_name = None
        self.groups = []
        self.exercises = []
        self.search()

    def findGroup(self, group):
        for g in self.groups:
            if group == g.name:
                return g
        return None

    def findExercise(self, group, exercise):
        group = self.findGroup(group)
        if group is not None:
            return group.findExercise(exercise)
        return None

    def reset(self):
        self.exercises = []
        self.groups = []

    def search(self):
        self.reset()

        path_to_exercises = self.getPathToExercises()
        print path_to_exercises

        for root, dirs, files in os.walk(path_to_exercises):
            group_name = string.replace(root, self.BASE_PATH, '')
            exercise_group = ExerciseGroup(group_name)
            exercises = []  

            sorted_files = sorted(files, key=lambda e: e.lower())
            for file_name in sorted_files:
                if file_name.endswith('.json'):
                    full_path = os.path.join(root, file_name)
                    exercise_file = ExerciseFile(full_path, file_name, exercise_group)
                    exercises.append(exercise_file)

            if len(exercises) > 0:
                exercise_group.add(exercises)
                self.groups.append(exercise_group)
                self.exercises.extend(exercises)

    def getPathToExercises(self):
        p = self.BASE_PATH
        if self.course_name is not None:
            p = os.path.join(p, self.course_name)
        return p

    def asDict(self):
        return {
            "course_name": self.course_name,
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

class ExerciseFile:
    def __init__(self, full_path, file_name, exercise_group):
        self.full_path = full_path
        self.group = exercise_group
        self.file_name = file_name
        self.name = file_name.replace('.json', '')
        self.data = None
        self.selected = False

    def is_valid(self):
        if self.data is None:
            return False
        for key in ['key', 'chord', 'introText', 'type']:
            if not (key in self.data):
                return False

    def load(self):
        try:
            with open(self.full_path) as f:
                data = f.read().strip()
                self.data = json.loads(data)
        except IOError as e:
            raise ExerciseFileError("Error loading exercise file: {0} => {1}".format(e.errno, e.strerror))
        return True

    def save(self):
        if not self.is_valid():
            return False

        try:
            with open(self.full_path, 'w') as f:
                json_data = json.dumps(self.data, sort_keys=True, indent=4, separators=(',', ': '))
                f.write(json_data)
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
        return reverse('lab:exercise', kwargs={
            "group_name": self.group.name, 
            "exercise_name": self.name
        })

    def asJSON(self):
        return json.dumps(self.asDict())

    def asDict(self):
        d = {}
        if self.data is not None:
            d.update(self.data)
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
    
    @classmethod
    def create(cls, data):
        er = ExerciseRepository()
        group = er.findGroup(data['group_name'])
        
        max_n = 99
        n = group.size() + 1
        file_name = "%s.json" % str(n).zfill(2)
        full_path = os.path.join(ExerciseRepository.BASE_PATH, group.name, file_name)
        while os.path.exists(full_path):
            n += 1
            if n > max_n:
                break
            file_name = "%s.json" % str(n).zfill(2)
            full_path = os.path.join(ExerciseRepository.BASE_PATH, group.name, file_name)

        ef = ExerciseFile(full_path, file_name, group.name)
        ef.data = data

        return ef    

class ExerciseGroup:
    def __init__(self, group_name):
        self.name = group_name
        if self.name.startswith('/'):
            self.name = self.name[1:]
        self.group = []
        
    def size(self):
        return len(self.group)    

    def add(self, exercises):
        self.group.extend(exercises)
        return self

    def first(self):
        if len(self.group) > 0:
            return self.group[0]
        return None

    def last(self):
        if len(self.group) > 0:
            return self.group[-1]
        return None

    def next(self, exercise):
        if exercise in self.group:
            index = self.group.index(exercise)
            if index < len(self.group) - 1:
                return self.group[index + 1]
        return None

    def previous(self, exercise):
        if exercise in self.group:
            index = self.group.index(exercise)
            if index > 0:
                return self.group[index - 1]
        return None

    def findExercise(self, exercise_name):
        for e in self.group:
            if exercise_name == e.name:
                return e
        return None

    def getList(self):
        exercise_list = []
        for e in self.group:
            d = e.asDict()
            exercise_list.append({
                "id": d['id'],
                "name": d['name'], 
                "parent": d['parent'],
                "url": d['url'],
                "selected": d['selected']
            })
        return exercise_list

    def asJSON(self):
        return json.dumps(self.asDict())

    def asDict(self):
        return {
            "name": self.name, 
            "data": {
                "exercises": [e.asDict() for e in self.group]
            }
        }

    def __str__(self):
        return '[' + ', '.join([str(e) for e in self.group]) + ']'

    def __repr__(self):
        return self.__str__()

class ExerciseLilyPond:
    pass

