# Local development settings
from harmony.settings.common import *

LTI_OAUTH_CREDENTIALS = {
    'wp.sandbox': 'sandboxsecret',
}

INSTALLED_APPS += (
    'debug_toolbar',
)

MIDDLEWARE_CLASSES += (
    'debug_toolbar.middleware.DebugToolbarMiddleware',
)
