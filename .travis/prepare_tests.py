#!/usr/bin/python

import json
import os.path

cur_dir = os.path.dirname(os.path.realpath(__file__))
root_dir = os.path.dirname(cur_dir)
lib_dir = os.path.join(root_dir, 'lab', 'static', 'js', 'lib')
src_dir = os.path.join(root_dir, 'lab', 'static', 'js', 'src')
spec_dir = os.path.join(root_dir, 'lab', 'static', 'js', 'spec')
spec_runner_file = os.path.join(cur_dir, "generated_spec_runner.js")
spec_runner_file_name = "generated_spec_runner"
spec_runner_path = os.path.join(cur_dir, spec_runner_file_name)
requirejs_config_file = os.path.join(cur_dir, "generated_require_config.js")

def get_all_specs():
    '''Returns a list of paths to all spec files with the extension stripped off.'''
    all_specs = []
    required_suffix = '_spec.js'
    strip_prefix_len = len(os.path.join(root_dir, 'lab', 'static', 'js', '')) # with trailing slash

    for curpath, dirs, files in os.walk(spec_dir):
        for name in files:
            if name.endswith(required_suffix):
                spec_file = os.path.join(curpath, name)
                spec_require_name = spec_file[strip_prefix_len:-len('.js')]
                all_specs.append(spec_require_name)
    return all_specs

def get_spec_content(spec_files):
    '''Returns the javascript to execute the jasmine tests.'''
    spec_files_json = json.dumps(spec_files)
    return "".join([
        "define(function() {" + os.linesep,
        "\trequire("+spec_files_json+", function(){" + os.linesep,
        "\t\tconsole.log('Jasmine test suite loaded.');" + os.linesep,
        "\t\tvar consoleReporter = new jasmine.ConsoleReporter();" + os.linesep,
        "\t\tvar jasmineEnv = jasmine.getEnv();" + os.linesep,
        "\t\tjasmineEnv.addReporter(consoleReporter);" + os.linesep,
        "\t\tjasmineEnv.execute();" + os.linesep,
        "\t});" + os.linesep,
        "});" + os.linesep,
    ])

def get_requirejs_config():
    '''Returns a requirejs config for phantomjs to find files locally.'''
    return {
        "baseUrl": lib_dir,
        "paths": {
            "app": src_dir,
            "spec": spec_dir,
            "generated_spec_runner": spec_runner_path
        }
    }

def get_requirejs_content(requirejs_config):
    '''Returns the javascript to execute the requirejs config and load the spec runner.'''
    requirejs_config_json = json.dumps(requirejs_config, indent=4, separators=(',', ': '))
    return "".join([
        "requirejs.config("+requirejs_config_json+");" + os.linesep,
        "window.onload = function() {"+os.linesep,
        "\tconsole.log(Array(20).join('-'));"+os.linesep,
        "\trequire(['"+spec_runner_file_name+"']);"+os.linesep,
        "};"+os.linesep
    ])

def write_js_file(file_name, content):
    '''Utility to write js content to a file.'''
    with open(file_name, 'w') as f:
        print "Writing {0}...".format(file_name)
        f.write(content)


all_specs = get_all_specs()
spec_runner_content = get_spec_content(all_specs)

requirejs_config = get_requirejs_config()
requirejs_config_content = get_requirejs_content(requirejs_config)

write_js_file(spec_runner_file, spec_runner_content)
print spec_runner_content
write_js_file(requirejs_config_file, requirejs_config_content)
print requirejs_config_content
