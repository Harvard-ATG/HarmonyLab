define([
	'module', 
	'jquery', 
	'app/components/app/play', 
	'app/components/app/exercise'
], function(
	module, 
	$
) {
	var MODULE_CONFIG = module.config();
	var BASE_URL = '/';
	if("base_url" in MODULE_CONFIG && MODULE_CONFIG.base_url) {
		BASE_URL = MODULE_CONFIG.base_url;
	}

	var match = function(path) {
		return new RegExp("^" + BASE_URL + path, "i");
	};

	var ROUTES = [
		{url: match("lab/?$"), app: 'app/components/app/play'},
		{url: match("lab/exercise/\\d+$"), app: 'app/components/app/exercise'}
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
