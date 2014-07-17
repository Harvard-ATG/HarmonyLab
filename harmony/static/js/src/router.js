define(['jquery'], function($) {

	var onReady = function(app) {
		$(document).ready(app.ready);
	};
	
	var router = function(routes, path) {
		path = path || window.location.pathname;
		var found = false;

		for(var i = 0, len = routes.length; i < len; i++) {
			if(routes[i].re.test(path)) {
				found = true;
				require([routes[i].app], onReady);
				break;
			}
		}

		if(!found) {
			console.log("error: no route found to load");
		}

		return found;
	};

	return router;
});
