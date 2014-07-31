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
	//console.log("Requested: ", request.url);
};
page.onResourceReceived = function(response) {
	//console.log('Receive ' + JSON.stringify(response, undefined, 4));
};
page.onInitialized = function() {
	//console.log("Page initialized.");
};
page.open(url);


function checkFinished(msg) {
	var finished = /^ConsoleReporter finished \[(PASSED|FAILED)\]$/;
	var result, failed;

	if(finished.test(msg)) {
		result = finished.exec(msg);
		failed = (result[1] === 'PASSED' ? 0 : 1);
		phantom.exit(failed);
	}
}

