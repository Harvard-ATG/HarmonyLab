#!/usr/bin/python

import sys, os, os.path
from subprocess import call

cur_dir = os.path.dirname(os.path.realpath(__file__))
parent_dir = os.path.dirname(cur_dir)

statuses = [
    call(["echo", "Running python unit tests via nose..."]),
    call([os.path.join(parent_dir, "manage.py"), "test", "lab.tests"], env=os.environ.copy()),
    call([os.path.join(cur_dir, "prepare_tests.py")], env=os.environ.copy()),
    call(["/usr/bin/env", "phantomjs", os.path.join(cur_dir, "jasmine.js")], env=os.environ.copy()),
]

final_status = 0
for status in statuses:
    if status != 0:
        final_status = status
        break

sys.exit(final_status)
