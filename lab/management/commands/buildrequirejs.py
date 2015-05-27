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
#   ./manage.py buildrequirejs
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings

import subprocess
import os
import shutil
import hashlib
import json

ROOT_DIR = settings.ROOT_DIR
BUILD_CONFIG = os.path.join(ROOT_DIR, 'lab', 'static', 'js', 'conf', 'requirejs.json')
BUILD_OUTPUT_DIR = os.path.join(ROOT_DIR, 'lab', 'static', 'js', 'build')
BUILD_OUTPUT_FILE = os.path.join(BUILD_OUTPUT_DIR, 'main-built.js')
BUILD_DATA_DIR = os.path.join(ROOT_DIR, 'data', 'requirejs')
BUILD_DATA_FILE = os.path.join(BUILD_DATA_DIR, 'build.json')

class Command(BaseCommand):
    help = 'Builds and combines the RequireJS modules.'

    def handle(self, *args, **options):
        self._check_build_paths()
        self._run_optimizer()
        version = self._get_build_version()
        self._install_build(version)

    def _install_build(self, version):
        build_file_name = 'main-{0}'.format(version)
        build_path = os.path.join(BUILD_OUTPUT_DIR, build_file_name + '.js')

        if os.path.exists(build_path):
            self.stdout.write("Skipping because version already exists: {0}".format(build_path))
        else:
            shutil.copy(BUILD_OUTPUT_FILE, build_path)
            self.stdout.write("Created new version {0}".format(build_path))

            f = open(BUILD_DATA_FILE, 'w+') 
            f.write(json.dumps({'main': build_file_name}))
            f.close()
            self.stdout.write("Updated build data in {0}".format(BUILD_DATA_FILE))

    def _get_build_version(self):
        version = 'VERSION'
        with open(BUILD_OUTPUT_FILE) as f:
            m = hashlib.md5()
            while True:
                chunk = f.read(128) # 128 bytes for md5 block size
                if not chunk:
                    break
                m.update(chunk)
            version = m.hexdigest()
        self.stdout.write("Got version {0}".format(version))
        return version

    def _run_optimizer(self):
        requirejs_optimizer = "r.js -o {0}".format(BUILD_CONFIG)
        self.stdout.write("Running require.js optimizer: {0}".format(requirejs_optimizer))
        subprocess.check_call(requirejs_optimizer, shell=True)

    def _check_build_paths(self):
        for d in [BUILD_DATA_DIR, BUILD_OUTPUT_DIR]:
            if os.path.exists(d):
                self.stdout.write("Build dir already exists: {0}\n".format(d))
            else:
                os.makedirs(d)
                self.stdout.write("Created build dir: {0}\n".format(d))
