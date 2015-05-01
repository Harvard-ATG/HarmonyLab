define([
	'module',
	'lodash',
	'jquery',
	'app/components/app',
	'app/components/ui/main_menu',
	'app/components/notifications',
	'app/components/form/exercise_form'
], function(
	module,
	_,
	$,
	AppComponent,
	MainMenuComponent,
	NotificationsComponent,
	ExerciseFormComponent
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
	
	AppManageComponent.prototype.init = function() {
		$('#managetabs').tabs();
		AppComponent.prototype.init.call(this);
	};

	/**
	 * Executed after the component is setup.
	 */
	AppManageComponent.prototype.afterSetup = function() {
	};
	
	/**
	 * Returns an array of functions that will create and initialize
	 * each sub-component of the application.
	 *
	 * @return {array} of functions
	 */
	AppManageComponent.prototype.getComponentMethods = function() {
		var methods = [
			function () {
				var c = new NotificationsComponent();
				c.init(this);
				c.renderTo("#notifications");
				this.addComponent(c);
			},
			function() {
				var c = new MainMenuComponent({
					headerEl: "#header",
					menuEl: "#mainmenu",
					menuSelector: ".js-btn-menu"
				});
				c.init(this);
				this.addComponent(c);
			},
			function() {
				var c = new ExerciseFormComponent({
					el: "#exerciseform" 
				});
				c.init(this);
				this.addComponent(c);
			}
		];
		return methods;
	};

	AppManageComponent.prototype.initComponent = function() {
		AppComponent.prototype.initComponent.apply(this, arguments);
		console.log("init component manage");
	};

	return AppManageComponent;
});
