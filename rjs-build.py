#!/usr/bin/env python

# DESCRIPTION
#
# This script builds the javascript require.js modules into 
# a single file. This is intended for production usage. For
# development, it is not necessary to run this script.
#
# The result of running this script is a build directory 
# with the resulting js and a JSON file that points to
# current build:
#
# {{ ROOT_DIR }}/rjs-build.json
#
# {{ STATIC_FILES_DIR }}/js/build/
# 		main-built.js
#		main-a47208f8dbbc5e65f4d6424d90f26aa628a007e6.js
#
# --------------------------------------------------
#
# DEPENDENCIES:
# 	
# In order to run this script, node.js must be installed
# along with the require.js optimizer "r.js." 
#
# 	npm -g install requirejs
# 
# Example usage of running the r.js optimizer:
#
# 	r.js -o build.js optimize=none
#
# Note: "optimize=none" flag disables minification.
#
# --------------------------------------------------
#
# USAGE:
#
# 	./rjs-build.py

from harmony.settings import common

import subprocess
import os
import shutil
import hashlib
import json

PROJECT_ROOT = common.PROJECT_ROOT
ROOT_DIR = common.ROOT_DIR

BUILD_JS = os.path.join(PROJECT_ROOT, 'static', 'js', 'build.js')
BUILD_DIR = os.path.join(PROJECT_ROOT, 'static', 'js', 'build')
BUILD_OUTPUT_FILE = os.path.join(BUILD_DIR, 'main-built.js')

if not os.path.exists(BUILD_DIR):
	os.makedirs(BUILD_DIR)

# Run the require.js optimizer
requirejs_optimizer = "r.js -o {0} optimize=none".format(BUILD_JS)
print "Running require.js optimizer: {0}".format(requirejs_optimizer)
subprocess.check_call(requirejs_optimizer, shell=True)

# Hash the file to get a version number.
version = 'VERSION'
with open(BUILD_OUTPUT_FILE) as f:
    m = hashlib.md5()
    while True:
        chunk = f.read(128) # 128 bytes for md5 block size
        if not chunk:
            break
        m.update(chunk)
    version = m.hexdigest()
print "Got version {0}".format(version)

# Copy and rename the build file 
build_file = 'main-{0}'.format(version)
build_path = os.path.join(BUILD_DIR, build_file+'.js')

if os.path.exists(build_path):
    print "Build version already exists: {0}.js".format(build_file)
else:
    shutil.copy(os.path.join(BUILD_DIR, 'main-built.js'), build_path)
    print "Copied main-built.js to {0}.js".format(build_file)

    build_json = json.dumps({'main': build_file})
    f = open(os.path.join(ROOT_DIR, 'rjs-build.json'), 'w+') 
    f.write(build_json)
    f.close()
    print "Saved data to rjs-build.json"

print ("-" * 50)
print "Done."
