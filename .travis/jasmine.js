var system = require('system');
var page = require('webpage').create();
var url = 'SpecRunner.html';
var fs = require('fs');

if(system.args[1]) {
	url = system.args[1];
}




page.onConsoleMessage = function(msg) {
	console.log(msg);
	checkFinished(msg);
};
page.onResourceRequested = function(request) {
  //console.log('Request ' + JSON.stringify(request, undefined, 4));
};
page.onResourceReceived = function(response) {
  //console.log('Receive ' + JSON.stringify(response, undefined, 4));
};
page.onInitialized = function() {
	page.evaluate(function(cwd) {
		var up = function(path) {
			path = path || [];
			var parts = path.split('/');
			parts.pop()
			return parts.join('/');
		};
		var join = function(path, parts) {
			if(parts.length === 0) {
				return path;
			}
			return path + '/' + parts.join('/');
		};
		var config = {
			"baseUrl": join(up(cwd),["harmony","static","js","lib"]),
			"paths": {
				"app": join(up(cwd),["harmony","static","js","src"]),
				"spec": join(up(cwd),["harmony","static","js","spec"]),
				"SpecRunner": join(cwd,["SpecRunner"])
			}
		};
		console.log("Initializing requirejs.config to ", JSON.stringify(config));

		window.REQUIREJS_CONFIG = config;

	}, fs.absolute(fs.workingDirectory));
};
page.open(url, function(status) {});




function checkFinished(msg) {
	var finished = /^ConsoleReporter finished \[(PASSED|FAILED)\]$/;
	var result, failed;

	if(finished.test(msg)) {
		result = finished.exec(msg);
		failed = result[1] === 'PASSED' ? 0 : 1;
		phantom.exit(failed);
	}
}

