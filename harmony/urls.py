from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', 'harmony.apps.lab.views.index', name='index'),
	url(r'^login/$', 'django_openid_auth.views.login_begin', name='openid-login'),
	url(r'^login-complete/$', 'django_openid_auth.views.login_complete', name='openid-complete'),
	url(r'^logout/$', 'django.contrib.auth.views.logout', {'next_page': '/',}, name='logout'),
	url(r'^static/(?P<path>.*)$', 'django.views.static.serve', 
		{'document_root': '/Applications/MAMP/htdocs/lab/lab/static'}),
    # url(r'^lab/', include('lab.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
