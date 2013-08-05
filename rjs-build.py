#!/usr/bin/env python

from harmony.settings import common

# This script builds the javascript modules into a single
# file that may be loaded instead of loading each module
# separately. This is intended for production usage.
#
# The result of running this script is a build directory 
# with the following files:
#
# build/
# 		current.txt 
# 		main-built.js
#		main-a47208f8dbbc5e65f4d6424d90f26aa628a007e6.js
#
# The current.txt file contains a single line with the name
# of the most current build version (i.e. "main-a472...js").
# This directory and its contents should be ignored by git.
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
# USAGE:
#
# 	./rjs-build.py

from subprocess import call, check_call, check_output
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
check_call(requirejs_optimizer, shell=True)

# Lookup current git head version
version = check_output("git rev-parse HEAD", shell=True) 
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
