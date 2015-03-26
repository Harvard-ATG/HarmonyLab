define([
	'lodash',
	'jquery',
	'app/components/component'
], function(
	_,
	$,
	Component
) {

	/**
	 * AppComponent class.
	 *
	 * The app component creates and manages the user-interface and
	 * behaviors on the screen. There should be only one instance of 
	 * an app component on the page. 
	 *
	 * Concrete classes should implement the following methods:
	 *	- getComponentMethods()
	 *	- beforeSetup()
	 *	- afterSetup()
	 *
	 * @param {object} settings
	 * @constructor
	 */
	var AppComponent = function(settings) {
		Component.call(this, settings);
		this.settings = settings || {};
		this.models = {};
	};

	AppComponent.prototype = new Component();

	/**
	 * Initializes the component and sub-components.
	 * 
	 * @return undefined
	 */
	AppComponent.prototype.initComponent = function() {
		var i, len, methods = [];

		this.models = this.getModels();
		this.beforeSetup();

		methods = this.getComponentMethods();
		for(i = 0, len = methods.length; i < len; i++) {
			methods[i].call(this);
		}

		this.afterSetup();
	};

	/**
	 * Called before the sub-components are setup.
	 *
	 * Should return an array of methods that will
	 * setup sub-components.
	 * 
	 * @return {object}
	 */
	AppComponent.prototype.getComponentMethods = function() {
		return [function() {}];
	};

	/**
	 * Called before the sub-components are setup.
	 *
	 * Should return a mapping of model names and
	 * model objects..
	 * 
	 * @return {object}
	 */
	AppComponent.prototype.getModels = function() {
		return {};
	};

	/**
	 * Called before the sub-components are setup.
	 * 
	 * @return undefined
	 */
	AppComponent.prototype.beforeSetup = function() {
	};

	/**
	 * Called after the sub-components are setup.
	 * 
	 * @return undefined
	 */
	AppComponent.prototype.afterSetup = function() {
		this.fadeIn();
	};

	/**
	 * Implements fade-in/out on an element.
	 *
	 * @return undefined
	 */
	AppComponent.prototype.fade = function(state) {
		// fade in [state=true], fade out [state=false]
		$('.js-fade-in').css('opacity', state ? 1 : 0);
		$('.js-fade-out').css('opacity', state ? 0 : 1);
	};

	/**
	 * Convenience method to fade-in
	 *
	 *  @return undefined
	 */
	AppComponent.prototype.fadeIn = function() {
		this.fade(true);
	};

	/**
	 * Convenience method to fade-out
	 *
	 *  @return undefined
	 */
	AppComponent.prototype.fadeOut = function() {
		this.fade(false);
	};

	return AppComponent;
});
