define(['jquery', 'app/components/app/play', 'app/components/app/exercise'], function($) {
	var ROUTES = [
		{url: /^\/?$/, app: 'app/components/app/play'},
		{url: /^\/exercise\/\d+$/, app: 'app/components/app/exercise'}
	];

	var router = function() {
		var path = window.location.pathname;
		var found = false;

		for(var i = 0, len = ROUTES.length; i < len; i++) {
			if(ROUTES[i].url.test(path)) {
				found = true;
				require([ROUTES[i].app], function(app) {
					$(document).ready(app.ready)
				});
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
