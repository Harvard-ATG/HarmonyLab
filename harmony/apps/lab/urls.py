from django.conf.urls import patterns, url
from .views import PlayView, ExerciseView, LTIToolConfigView, LTILaunchView

urlpatterns = patterns(
    '',
    url(r'^$', PlayView.as_view(), name='index'),
    url(r'^exercise/(?P<exercise_id>.*)$', ExerciseView.as_view(), name="exercise"),
    url(r'^lti-launch$', LTILaunchView.as_view(), name='lti-launch'),
    url(r'^lti-tool-config$', LTIToolConfigView.as_view(), name='lti-tool-config'),
)
