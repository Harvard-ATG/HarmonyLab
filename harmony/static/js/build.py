#!/usr/bin/env python

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

from subprocess import call, check_call, check_output
import os
import shutil

if not os.path.exists('build'):
	os.makedirs('build')

# Run the require.js optimizer
check_call("r.js -o build.js optimize=none", shell=True)

# Lookup current git head version
version = check_output("git rev-parse HEAD", shell=True) 
version = version.rstrip()

# Set the build file name using the version and make a copy 
build_file = 'main-{0}'.format(version)

f = open(os.path.join('build', 'current.txt'), 'w+') 
f.write(build_file)
f.close()

shutil.copy(
	os.path.join('build', 'main-built.js'), 
	os.path.join('build', build_file+'.js')
)

print "Optimized main.js via Require.js optimizer. File: {0}".format(build_file)
