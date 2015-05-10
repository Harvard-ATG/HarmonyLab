define([
	'module',
	'app/components/app/play',
	'app/components/app/exercise',
	'app/components/app/manage'
], function(module) {

	// The "main" module simply looks at the configure "app_module", 
	// loads it with requirejs, and then executes the "ready" function. 
	// The application module to load should be specified in the global 
	// requirejs config like this:
	//
	//		requirejs.config({ 
	//			config: { 
	//				'app/main': {
	//					'app_module': 'path/to/my/app/module'
	//				}
	//			}
	//		});
	//
	// Note: the requirejs config is set outside this module in one of the base 
	// templates.
	
	var config = module.config();
	if (!config.app_module) {
		throw new Error("Application module not configured. Please pass a config value for 'app_module' to the 'main' module.");
	}

	require([config.app_module], function(app) {
		// Execute the app.ready() function when the DOM is ready.
		$(document).ready(app.ready);
	});
});
