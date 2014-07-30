#!/usr/bin/python

import json
import os.path

cur_dir = os.path.dirname(os.path.realpath(__file__))
spec_file = os.path.join(cur_dir, "SpecRunner.js")
root_dir = os.path.dirname(cur_dir)

def get_all_specs():
    all_specs = []
    required_suffix = '_spec.js'
    spec_dir = os.path.join(root_dir, 'harmony', 'static', 'js', 'spec')
    strip_prefix_len = len(os.path.join(root_dir, 'harmony', 'static', 'js', '')) # with trailing slash

    for curpath, dirs, files in os.walk(spec_dir):
        for name in files:
            if name.endswith(required_suffix):
                spec_file = os.path.join(curpath, name)
                spec_require_name = spec_file[strip_prefix_len:-len('.js')]
                all_specs.append(spec_require_name)
    return all_specs

all_specs = get_all_specs()

spec_content = ''
spec_content += "define(function() {" + os.linesep
spec_content += "\trequire("+json.dumps(all_specs)+", function(){" + os.linesep
spec_content += "\t\tconsole.log('Specs loaded.');" + os.linesep
spec_content += "\t\tvar consoleReporter = new jasmine.ConsoleReporter();" + os.linesep
spec_content += "\t\tvar htmlReporter = new jasmine.HtmlReporter();" + os.linesep
spec_content += "\t\tvar jasmineEnv = jasmine.getEnv();" + os.linesep
spec_content += "\t\tjasmineEnv.addReporter(consoleReporter);" + os.linesep
spec_content += "\t\tjasmineEnv.addReporter(htmlReporter);" + os.linesep
spec_content += "\t\tjasmineEnv.execute();" + os.linesep
spec_content += "\t});" + os.linesep
spec_content += "});" + os.linesep

with open(spec_file, 'w') as f:
    print "Writing " + spec_file + "..."
    f.write(spec_content)
