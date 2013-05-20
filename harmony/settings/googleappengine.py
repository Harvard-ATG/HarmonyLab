# Google App Engine Settinsg
from harmony.settings.common import *

DATABASES = {
    'default': {
        'ENGINE': 'google.appengine.ext.django.backends.rdbms',
        'INSTANCE': 'harmony-lab:instance1',
        'NAME': 'harmony-lab',
    }
}
