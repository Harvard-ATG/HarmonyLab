define([
	'module',
	'lodash',
	'jquery',
	'app/components/app'
], function(
	module,
	_,
	$,
	AppComponent
) {

	/**
	 * AppManageComponent class.
	 *
	 * Creates the sandbox environment for playing and experimenting
	 * with chords and chord sequences. This is the basic mode of the
	 * application for students to just play around and try things.
	 *
	 * @constructor
	 */
	var AppManageComponent = function(settings) {
		AppComponent.call(this, settings);
	};

	AppManageComponent.prototype = new AppComponent();

	AppManageComponent.ready = function() {
		var app = new AppManageComponent();
		app.init();
		console.log("initialized manage component");
	};

	//AppManageComponent.prototype.getModels = function() {};

	AppManageComponent.prototype.initComponent = function() {
		AppComponent.prototype.initComponent.apply(this, arguments);
		console.log("init component manage");
	};

	return AppManageComponent;
});
