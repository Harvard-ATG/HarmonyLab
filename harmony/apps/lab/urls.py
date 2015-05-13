from django.conf.urls import patterns, url
from .views import PlayView, ExerciseView, ManageView
from .views import APIView, APIExerciseView, APIGroupView
from .views import LTIToolConfigView, LTILaunchView

urlpatterns = patterns(
    '',
    url(r'^$', PlayView.as_view(), name='index'),
    url(r'^api$', APIView.as_view(), name="api"),
    url(r'^api/v1/exercise$', APIExerciseView.as_view(), name="api-exercise"),
    url(r'^api/v1/group$', APIGroupView.as_view(), name="api-group"),
    url(r'^exercise/(?P<course_name>\w+)/(?P<group_name>\w+(?:/\D\w*)?)/(?P<exercise_name>\d+)$', ExerciseView.as_view(), name="exercise"),
    url(r'^exercise/(?P<course_name>\w+)/(?P<group_name>\w+(?:/\D\w*)?)$', ExerciseView.as_view(), name="exercise-group"),
    url(r'^manage$', ManageView.as_view(), name="manage"),
    url(r'^lti-launch$', LTILaunchView.as_view(), name='lti-launch'),
    url(r'^lti-tool-config$', LTIToolConfigView.as_view(), name='lti-tool-config'),
)
