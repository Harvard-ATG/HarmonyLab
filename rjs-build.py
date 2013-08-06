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
# The"optimize=none" flag disables minification.
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
import json

PROJECT_ROOT = common.PROJECT_ROOT
ROOT_DIR = common.ROOT_DIR

BUILD_JS = os.path.join(PROJECT_ROOT, 'static', 'js', 'build.js')
BUILD_DIR = os.path.join(PROJECT_ROOT, 'static', 'js', 'build')

if not os.path.exists(BUILD_DIR):
	os.makedirs(BUILD_DIR)

# Run the require.js optimizer
requirejs_optimizer = "r.js -o {0} optimize=none".format(BUILD_JS)
print "Running require.js optimizer: {0}".format(requirejs_optimizer)
subprocess.check_call(requirejs_optimizer, shell=True)

# Lookup current git head version
version = subprocess.check_output("git rev-parse HEAD", shell=True) 
version = version.rstrip()
print "Got version {0}".format(version)

# Set the build file name using the version and make a copy 
build_file = 'main-{0}'.format(version)
shutil.copy(
	os.path.join(BUILD_DIR, 'main-built.js'), 
	os.path.join(BUILD_DIR, build_file+'.js')
)
print "Copied main-built.js to {0}.js".format(build_file)

build_json = json.dumps({'main': build_file})
f = open(os.path.join(ROOT_DIR, 'rjs-build.json'), 'w+') 
f.write(build_json)
f.close()
print "Saved data to rjs-build.json"

print ("-" * 50)
print "Done."
