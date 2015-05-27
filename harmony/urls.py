from django.conf.urls import patterns, include, url
from django.views.generic.base import RedirectView

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', RedirectView.as_view(url='/lab'), name='index'),
    url(r'^lab/', include('lab.urls', namespace="lab")),
    url(r'^lti/', include('lti.urls', namespace="lti")),
    url(r'^jasmine/', include('jasmine.urls', namespace="jasmine")),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
