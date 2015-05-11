from django.conf.urls import patterns, url
from .views import PlayView, ExerciseView, ManageView, APIView, APIExerciseView, LTIToolConfigView, LTILaunchView

urlpatterns = patterns(
    '',
    url(r'^$', PlayView.as_view(), name='index'),
    url(r'^api$', APIView.as_view(), name="api"),
    url(r'^api/v1/exercise$', APIExerciseView.as_view(), name="api-exercise"),
    url(r'^exercise/(?P<exercise_id>.*)$', ExerciseView.as_view(), name="exercise"),
    url(r'^manage$', ManageView.as_view(), name="manage"),
    url(r'^lti-launch$', LTILaunchView.as_view(), name='lti-launch'),
    url(r'^lti-tool-config$', LTIToolConfigView.as_view(), name='lti-tool-config'),
)
