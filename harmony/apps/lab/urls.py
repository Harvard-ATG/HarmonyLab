from django.conf.urls import patterns, url
from .views import PlayView, ExerciseView, ManageView, APIView, LTIToolConfigView, LTILaunchView

urlpatterns = patterns(
    '',
    url(r'^$', PlayView.as_view(), name='index'),
    url(r'^api/v1/(?P<resource_id>.*)$', APIView.as_view(api_version=1), name="api"),
    url(r'^exercise/(?P<exercise_id>.*)$', ExerciseView.as_view(), name="exercise"),
    url(r'^manage$', ManageView.as_view(), name="manage"),
    url(r'^lti-launch$', LTILaunchView.as_view(), name='lti-launch'),
    url(r'^lti-tool-config$', LTIToolConfigView.as_view(), name='lti-tool-config'),
)
