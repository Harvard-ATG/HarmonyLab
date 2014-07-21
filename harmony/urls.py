from django.conf.urls import patterns, include, url
from harmony.apps.lab.views import PlayView, ExerciseView

# Uncomment the next two lines to enable the admin:
#from django.contrib import admin
#admin.autodiscover()

urlpatterns = patterns('',
    url(r'^lab/', include('harmony.apps.lab.urls', namespace="lab")),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),

    # Uncomment the next line to enable the jasmine test runner:
    url(r'^jasmine/', include('harmony.apps.jasmine.urls'))
)
