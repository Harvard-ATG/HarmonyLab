import os
import json
import logging
log = logging.getLogger(__name__)

# This block modifies the common require.js config to point main.js to an optimized
# (combined and minified) version of the project, if it exists. It expects to
# find the build file here:
#
#   data/requirejs/build.json:
#
# The contents should be JSON like this:
#   
#   {"main": "main-a1e2d2b970b1b0ced1d9b4e96442ef1f"}
#
# If a main.js build can't be found, the default require.js config will be used,
# which will result in each module file being loaded separately.
#
# To build, execute this python script:
#
#   ./build-requirejs.py
#
def configure(ROOT_DIR, STATIC_URL):
    try:
        BASE_URL
    except NameError:
        BASE_URL = ''

    REQUIREJS_DEBUG = True
    REQUIREJS_CONFIG = {
        'baseUrl': os.path.join(STATIC_URL, 'js', 'lib'),
        'paths': {
            'app': os.path.join(STATIC_URL, 'js', 'src'),
        },
        'config': {}
    }

    try: 
        REQUIREJS_BUILD = None
        REQUIREJS_BUILD_FILE = os.path.join(ROOT_DIR, 'data', 'requirejs', 'build.json')
        if os.path.isfile(REQUIREJS_BUILD_FILE):
            with open(REQUIREJS_BUILD_FILE, 'r') as f:
                REQUIREJS_BUILD = json.loads(f.read())
        else:
            log.debug('requirejs build file not found: {0}'.format(REQUIREJS_BUILD_FILE))

        if REQUIREJS_BUILD is not None:
            REQUIREJS_DEBUG = False
            REQUIREJS_CONFIG['paths']['app/main'] = os.path.join(STATIC_URL, 'js', 'build', REQUIREJS_BUILD['main'])
    except IOError as e:
        log.error('error reading requirejs build file: ({0}) {1}'.format(e.errno, e.strerror))

    return REQUIREJS_DEBUG, REQUIREJS_CONFIG
