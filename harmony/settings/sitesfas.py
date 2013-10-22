# Local development settings
import os
from harmony.settings.common import *

# OVERRIDE STATIC URL PATH
STATIC_URL = '/~abarrett/django/harmony/harmony/static/'

REQUIREJS_CONFIG = {
	'baseUrl': path.join(STATIC_URL, 'js', 'lib'),
	'paths': {
		'app': path.join(STATIC_URL, 'js', 'src'),
	},
}
