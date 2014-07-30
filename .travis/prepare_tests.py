#!/usr/bin/python

import json
import os.path

cur_dir = os.path.dirname(os.path.realpath(__file__))
root_dir = os.path.dirname(cur_dir)
lib_dir = os.path.join(root_dir, 'harmony', 'static', 'js', 'lib')
src_dir = os.path.join(root_dir, 'harmony', 'static', 'js', 'src')
spec_dir = os.path.join(root_dir, 'harmony', 'static', 'js', 'spec')
spec_runner_file = os.path.join(cur_dir, "generated_spec_runner.js")
spec_runner_file_name = "generated_spec_runner"
spec_runner_path = os.path.join(cur_dir, spec_runner_file_name)
requirejs_config_file = os.path.join(cur_dir, "generated_require_config.js")

def get_all_specs():
    all_specs = []
    required_suffix = '_spec.js'
    strip_prefix_len = len(os.path.join(root_dir, 'harmony', 'static', 'js', '')) # with trailing slash

    for curpath, dirs, files in os.walk(spec_dir):
        for name in files:
            if name.endswith(required_suffix):
                spec_file = os.path.join(curpath, name)
                spec_require_name = spec_file[strip_prefix_len:-len('.js')]
                all_specs.append(spec_require_name)
    return all_specs

all_specs = get_all_specs()

spec_runner_content = "".join([
    "define(function() {" + os.linesep,
    "\trequire("+json.dumps(all_specs, indent=4, separators=(',', ': '))+", function(){" + os.linesep,
    "\t\tconsole.log('Specs loaded.');" + os.linesep,
    "\t\tvar consoleReporter = new jasmine.ConsoleReporter();" + os.linesep,
    "\t\tvar htmlReporter = new jasmine.HtmlReporter();" + os.linesep,
    "\t\tvar jasmineEnv = jasmine.getEnv();" + os.linesep,
    "\t\tjasmineEnv.addReporter(consoleReporter);" + os.linesep,
    "\t\tjasmineEnv.addReporter(htmlReporter);" + os.linesep,
    "\t\tjasmineEnv.execute();" + os.linesep,
    "\t});" + os.linesep,
    "});" + os.linesep,
])

requirejs_config = {
    "baseUrl": lib_dir,
    "paths": {
        "app": src_dir,
        "spec": spec_dir,
        "generated_spec_runner": spec_runner_path
    }
}

requirejs_config_content = "".join([
    "requirejs.config("+json.dumps(requirejs_config, indent=4, separators=(',', ': '))+");" + os.linesep,
    "window.onload = function() {"+os.linesep,
    "\tconsole.log(Array(20).join('-'));"+os.linesep,
    "\trequire(['"+spec_runner_file_name+"']);"+os.linesep,
    "};"+os.linesep
])



with open(spec_runner_file, 'w') as f:
    print "Writing " + spec_runner_file + "..."
    f.write(spec_runner_content)

with open(requirejs_config_file, 'w') as f:
    print "Writing " + requirejs_config_file + "..."
    f.write(requirejs_config_content)



