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

    @staticmethod
    def getBasePath(course_name):
        if course_name is None:
            return ExerciseFileRepository.BASE_PATH
        return os.path.join(ExerciseFileRepository.BASE_PATH, "course", course_name)

    def getGroupList(self):
        '''Returns a list of group names.'''
        path_to_exercises = ExerciseFileRepository.getBasePath(self.course_name)
        groups = []
        for root, dirs, files in os.walk(path_to_exercises):
            group_name = string.replace(root, path_to_exercises, '')
            groups.append(ExerciseGroup(group_name, course_name=self.course_name))
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

        path_to_exercises = ExerciseFileRepository.getBasePath(self.course_name)

        for root, dirs, files in os.walk(path_to_exercises):
            group_name = string.replace(root, path_to_exercises, '')
            exercise_group = ExerciseGroup(group_name, course_name=self.course_name)
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
        return cls(json.loads(data))

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
        return reverse('lab:exercise', kwargs={
            "course_name": self.group.course_name,
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
    def create(data, **kwargs):
        group_name = data['group_name']
        course_name = kwargs.get("course_name", None)
        exercise = kwargs.get("exercise", None)
        file_name = kwargs.get('file_name', None)
        
        er = ExerciseFileRepository(course_name=course_name)
        group = er.findGroup(group_name)
        if group is None:
            group = ExerciseGroup(group_name, course_name=course_name)

        group_size = group.size()
        group_path = os.path.join(ExerciseFileRepository.getBasePath(course_name), group_name)

        if file_name is None:
            file_name = ExerciseFile.getNextFileName(group_path, group_size)
        
        ef = ExerciseFile(file_name, group, group_path)
        ef.exercise = exercise
        print course_name, file_name, group_path, ef.getPathToFile()
        ef.save()

        return ef

class ExerciseGroup:
    def __init__(self, group_name, *args, **kwargs):
        self.name = group_name
        self.course_name = kwargs.get("course_name", None)
        if self.name.startswith('/'):
            self.name = self.name[1:]
        self.exercises = []
        
    def size(self):
        return len(self.exercises)    

    def add(self, exercises):
        self.exercises.extend(exercises)
        return self

    def url(self):
        return reverse('lab:exercise-group', kwargs={"group_name": self.name, "course_name": self.course_name})

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

class ExerciseLilyPond:
    pass

