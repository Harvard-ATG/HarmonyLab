from django.conf import settings
from django.core.urlresolvers import reverse
import os
import os.path
import string
import json

class ExerciseFileError(Exception):
    pass

class ExerciseRepository(object):
    def __init__(self, *args, **kwargs):
        self.course_name = kwargs.get('course_name', None)
        self.groups = []
        self.exercises = []

    def getGroupNames(self):
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

class ExerciseFileRepository(ExerciseRepository):
    BASE_PATH = os.path.join(settings.ROOT_DIR, 'data', 'exercises', 'json')

    def __init__(self, *args, **kwargs):
        super(ExerciseFileRepository, self).__init__(*args, **kwargs)
        self.findFiles()

    @classmethod
    def getBasePath(cls, course_name):
        if course_name is None:
            return ExerciseFileRepository.BASE_PATH
        return os.path.join(ExerciseFileRepository.BASE_PATH, "course", course_name)

    def getGroupNames(self):
        '''Returns a list of group names.'''
        path_to_exercises = ExerciseFileRepository.getBasePath(self.course_name)
        groups = []
        for root, dirs, files in os.walk(path_to_exercises):
            group_name = string.replace(root, path_to_exercises, '')
            groups.append(ExerciseGroup(group_name))
        return sorted([g.name for g in groups if len(g.name)>0], key=lambda g: g.lower())

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

        path_to_exercises = ExerciseFileRepository.getBasePath(self.course_name)

        for root, dirs, files in os.walk(path_to_exercises):
            group_name = string.replace(root, path_to_exercises, '')
            exercise_group = ExerciseGroup(group_name)
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

class Exercise:
    def __init__(self, data, meta=None):
        self.data = {}
        self.meta = {}
        self.errors = {}

        self.data.update(data)
        if meta is not None:
            self.meta.update(meta)

    def isValid(self):
        return True

    def getData(self):
        return self.data

    def asJSON(self):
        return json.dumps(self.data, sort_keys=True, indent=4, separators=(',', ': '))

    @classmethod
    def fromJSON(cls, data):
        return Exercise(json.loads(data))

class ExerciseFile:
    def __init__(self, file_name, group, group_path=None):
        self.file_name = file_name
        self.group_path = group_path
        self.name = file_name.replace('.json', '')
        self.group = group
        self.exercise = None
        self.selected = False

    def load(self):
        try:
            with open(os.path.join(self.group_path, self.file_name)) as f:
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
            with open(os.path.join(self.group_path, self.file_name), 'w') as f:
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
        return reverse('lab:exercise', kwargs={
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

    @classmethod
    def getNextFileName(group, group_path):
        max_n = 99
        n = group.size() + 1

        file_name = "%s.json" % str(n).zfill(2)

        while os.path.exists(os.path.join(group_path, file_name)):
            n += 1
            if n > max_n:
                raise Exception("unable to secure exercise file name")
            file_name = "%s.json" % str(n).zfill(2)
            group_path = os.path.join(base_path, group.name)

        return file_name
    
    @classmethod
    def create(cls, data, **kwargs):
        course = kwargs.get("course", None)
        exercise = kwargs.get("exercise", None)
        file_name = kwargs.get('file_name', None)
        group_path = os.path.join(ExerciseFileRepository.getBasePath(course), group.name)

        er = ExerciseFileRepository(course)
        group = er.findGroup(data['group_name'])
        group_name = group.name

        if file_name is None:
            file_name = ExerciseFile.getNextFileName(group, group_path)
        
        ef = ExerciseFile(file_name, group_name, group_path)
        ef.save()

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

