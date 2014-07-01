define([
	'lodash',
	'jquery',
	'app/components/app'
], function(
	_,
	$,
	AppComponent
) {
	$(document).ready(function() {
		var app = new AppComponent();
		app.init();
	});
});
