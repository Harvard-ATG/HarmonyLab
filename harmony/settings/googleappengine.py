# Google App Engine Settinsg
from harmony.settings.common import *

import logging

log = logging.getLogger(__name__)

DATABASES = {
    'default': {
        'ENGINE': 'google.appengine.ext.django.backends.rdbms',
        'INSTANCE': 'harmony-lab:instance1',
        'NAME': 'harmony-lab',
    }
}

# This block modifies the common require.js config to point main.js to an optimized
# (combined and minified) version of the project.
#
# If a main.js build can't be found, the default require.js config will be used,
# which will result in each module file being loaded separately.
#
# To build main.js, see static/js/build.py.
#
try: 
	REQUIREJS_BUILD = None
	with open(path.join(PROJECT_ROOT, 'static', 'js', 'build', 'current.txt')) as f:
		REQUIREJS_BUILD = f.readline().rstrip()

	REQUIREJS_DEBUG = False
	REQUIREJS_CONFIG['paths']['app/main'] = path.join(STATIC_URL, 'js', 'build', REQUIREJS_BUILD)
except IOError as e:
	log.error('error configuring requirejs: ({0}) {1}'.format(e.errno, e.strerror))
