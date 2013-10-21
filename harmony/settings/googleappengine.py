# Google App Engine Settinsg
from harmony.settings.common import *

import logging
import json

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
# To build main.js, run rjs-build.py wrapper script in the root dir
#
try: 
	REQUIREJS_BUILD = None
	with open(path.join(ROOT_DIR, 'data', 'requirejs-build.json'), 'r') as f:
		REQUIREJS_BUILD = json.loads(f.read())

	REQUIREJS_DEBUG = False
	REQUIREJS_CONFIG['paths']['app/main'] = path.join(STATIC_URL, 'js', 'build', REQUIREJS_BUILD['main'])
except IOError as e:
	log.error('error configuring requirejs: ({0}) {1}'.format(e.errno, e.strerror))
