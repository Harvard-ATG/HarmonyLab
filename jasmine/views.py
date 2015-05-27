import logging
import os
import json

from django.conf import settings
from django.shortcuts import  render_to_response
from django.template import RequestContext

logger = logging.getLogger('jasmine')

def run_tests(request):
    all_specs = []
    required_suffix = '_spec.js'
    spec_dir = os.path.join(settings.PROJECT_ROOT, 'static', 'js', 'spec')
    strip_prefix_len = len(os.path.join(settings.PROJECT_ROOT, 'static', 'js', '')) # with trailing slash

    # find all spec files
    for curpath, dirs, files in os.walk(spec_dir):
        for name in files:
            if name.endswith(required_suffix):
                spec_file = os.path.join(curpath, name)
                spec_require_name = spec_file[strip_prefix_len:-len('.js')]
                all_specs.append(spec_require_name)
            else:
                logger.warning("Spec file missing required suffix {0}: {1} ".format(required_suffix, os.path.join(curpath, name)))

    data = { 'all_specs': all_specs }

    return render_to_response('jasmine/index.html', 
            data,
            context_instance=RequestContext(request))
