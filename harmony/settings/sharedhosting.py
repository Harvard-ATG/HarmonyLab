# Local development settings
import os
from harmony.settings.common import *

DEBUG = False
ALLOWED_HOSTS = ['.fas.harvard.edu'] # Required when Debug=False
FORCE_SCRIPT_NAME = None
STATIC_URL = '/static/'

# Configuration specific to shared hosting PROD/DEV environments
# PRODUCTION
if os.environ.get('SERVER_NAME') == 'harmonylab.fas.harvard.edu':
    FORCE_SCRIPT_NAME = '/'
    STATIC_URL = '/static/'
    DEBUG = False
# DEVELOPMENT
elif os.environ.get('SERVER_NAME') == 'sites.dev.fas.harvard.edu':
    FORCE_SCRIPT_NAME = '/~harmonylab/'
    STATIC_URL = '/~harmonylab/static/'
    DEBUG = True


# Configuration common to both PROD/DEV 
CONFIG_DIR = os.path.join(ROOT_DIR, 'config')

# These are sensitive values that should be retrieved from separate configuration files.
# Note that these config files should *NEVER* be stored in version control.
SECRET_KEY = None
with open(os.path.join(CONFIG_DIR, 'django_secret.txt')) as f:
    SECRET_KEY = f.read().strip()

LTI_OAUTH_CREDENTIALS = {}
with open(os.path.join(CONFIG_DIR, 'lti_oauth_credentials.txt')) as f:
    oauth_key_and_secret = f.read().strip().split(':',2)
    LTI_OAUTH_CREDENTIALS = dict([tuple(oauth_key_and_secret)])
