
from django.conf.urls import patterns, include, url

urlpatterns = patterns('jasmine',
    url(r'^$', 'views.run_tests', name='run_tests')
);
