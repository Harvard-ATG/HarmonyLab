#!/usr/bin/python

import sys
import os.path
from subprocess import call

cur_dir = os.path.dirname(os.path.realpath(__file__))
parent_dir = os.path.dirname(cur_dir)

statuses = [
    call(["echo", "Running python unit tests via nose..."]),
    call(["/usr/bin/env", "nosetests", parent_dir]),
    call([os.path.join(cur_dir, "make_spec_runner.py")]),
    call(["/usr/bin/env", "phantomjs", os.path.join(cur_dir, "jasmine.js")]),
]

final_status = 0
for status in statuses:
    if status != 0:
        final_status = status
        break

sys.exit(final_status)
