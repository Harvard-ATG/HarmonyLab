
from django.conf.urls import patterns, include, url

urlpatterns = patterns('harmony.apps.jasmine',
    url(r'^$', 'views.run_tests', name='run_tests')
);
