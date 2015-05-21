from django.db import models

class Course(models.Model):
    course_name_short = models.CharField(max_length=1024)
    course_name = models.CharField(max_length=2048)
    
    @classmethod
    def getCourseName(self, ):
        pass
    

    class Meta:
        verbose_name = 'Course'
        verbose_name_plural = 'Courses '
        ordering = ['course_name_short','course_name']

class LTIConsumer(models.Model):
    consumer_key = models.CharField(max_length=255, blank=False)
    resource_link_id = models.CharField(max_length=255, blank=False)
    context_id = models.CharField(max_length=255, blank=True, null=True)
    canvas_course_id = models.CharField(max_length=255, blank=True, null=True)
    course = models.ForeignKey(Course)
    
    @classmethod
    def hasCourse(cls, consumer_key, resource_link_id):
        return cls.objects.filter(consumer_key=consumer_key,resource_link_id=resource_link_id).exists()
    
    @classmethod
    def getConsumer(cls, consumer_key, resource_link_id):
        result = cls.objects.filter(consumer_key=consumer_key,resource_link_id=resource_link_id)
        if len(result) > 0:
            return result[0]
        return None
    
    @classmethod
    def setupCourse(cls, launch):
        if not ("consumer_key" in launch and "resource_link_id" in launch): 
            raise Exception("Missing required launch parameters: consumer_key and resource_link_id")
 
        course_name_short = launch.pop('course_name_short', 'untitled')
        course_name = launch.pop('course_name', 'Untitled Course')
        course = Course.objects.create(course_name_short=course_name_short,course_name=course_name)
 
        return cls.objects.create(course=course, **launch)
    
    class Meta:
        verbose_name = 'LTI Consumer'
        ordering = ['consumer_key','resource_link_id','context_id']
