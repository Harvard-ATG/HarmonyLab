#!/usr/bin/env python
#
# DESCRIPTION
#
# This script builds and minifies the require.js modules into a single
# file for production usage.
#
# Running this script results in a minified JS file and a JSON file that
# tells the app how to configure requrejs so that it uses the minified
# file instead of loading each module separately.
#
# DEPENDENCIES:
# 
# Node.js must be installed along with the require.js optimizer:
#
#   npm -g install requirejs
# 
# To run the optimizer on the command line:
#
#   r.js -o build.js optimize=none
#
# Note: "optimize=none" flag disables minification.
#
# USAGE:
#
#   ./build-requirejs.py

from harmony.settings import common

import subprocess
import os
import shutil
import hashlib
import json

#----------
# Setup build paths
PROJECT_ROOT = common.PROJECT_ROOT
ROOT_DIR = common.ROOT_DIR

BUILD_CONFIG = os.path.join(PROJECT_ROOT, 'static', 'js', 'build.js')
BUILD_OUTPUT_DIR = os.path.join(PROJECT_ROOT, 'static', 'js', 'build')
BUILD_OUTPUT_FILE = os.path.join(BUILD_OUTPUT_DIR, 'main-built.js')
BUILD_DATA_DIR = os.path.join(ROOT_DIR, 'data')
BUILD_DATA_FILE = os.path.join(BUILD_DATA_DIR, 'build-requirejs.json')

for d in [BUILD_DATA_DIR, BUILD_OUTPUT_DIR]:
	if not os.path.exists(d):
		os.makedirs(d)
		print "Created {0}\n".format(d)

#----------
# Run the require.js optimizer
requirejs_optimizer = "r.js -o {0} optimize=none".format(BUILD_CONFIG)
print "Running require.js optimizer: {0}".format(requirejs_optimizer)
subprocess.check_call(requirejs_optimizer, shell=True)

#----------
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

#----------
# Install the build if no such version already exists
build_file_name = 'main-{0}'.format(version)
build_path = os.path.join(BUILD_OUTPUT_DIR, build_file_name + '.js')

if os.path.exists(build_path):
    print "Skipping because version already exists: {0}".format(build_path)
else:
    shutil.copy(BUILD_OUTPUT_FILE, build_path)
    print "Created new version {0}".format(build_path)

    f = open(BUILD_DATA_FILE, 'w+') 
    f.write(json.dumps({'main': build_file_name}))
    f.close()
    print "Updated build data in {0}".format(BUILD_DATA_FILE)

print ("-" * 50), "\n", "Done."
