define([
	'lodash',
	'jquery',
	'app/components/component',
], function(
	_,
	$,
	Component
) {

	var AppComponent = function(settings) {
		this.settings = settings || {};
		this.models = {};
	};

	AppComponent.prototype = new Component();

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

	AppComponent.prototype.beforeSetup = function() {
	};

	AppComponent.prototype.afterSetup = function() {
		this.fadeIn();
	};

	AppComponent.prototype.fade = function(state) {
		// fade in [state=true], fade out [state=false]
		$('.js-fade-in').css('opacity', state ? 1 : 0);
		$('.js-fade-out').css('opacity', state ? 0 : 1);
	};

	AppComponent.prototype.fadeIn = function() {
		this.fade(true);
	};

	AppComponent.prototype.fadeOut = function() {
		this.fade(false);
	};

	return AppComponent;
});
