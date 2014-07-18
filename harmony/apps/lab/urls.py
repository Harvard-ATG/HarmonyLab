from django.conf.urls import patterns, url
from .views import HomeView, ExerciseView, ToolConfigView, LTILaunchView

urlpatterns = patterns(
    '',
    url(r'^$', HomeView.as_view(), name='index'),
    url(r'^lti_launch$', LTILaunchView.as_view(), name='lti-launch'),
    url(r'^exercise/(?P<exercise_id>[0-9]+)', ExerciseView.as_view(), name="exercise"),
    url(r'^tool_config$', ToolConfigView.as_view(), name='tool-config'),
)
