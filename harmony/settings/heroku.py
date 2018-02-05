import os
import json
from harmony.settings.common import *

DEBUG = True

SECRET_KEY = os.environ['SECRET_KEY']

ALLOWED_HOSTS = json.loads(os.environ.get('ALLOWED_HOSTS', '[]'))

LTI_OAUTH_CREDENTIALS = json.loads(os.environ.get('LTI_OAUTH_CREDENTIALS', '{}'))
