// Creates a **global** channel for application-wide event distribution.

/* global define: false */
(function(global) {
	define(['microevent'], function(MicroEvent) {
		"use strict";

		var EventBus = function() {};
		MicroEvent.mixin(EventBus);

		var Singleton = global.EventBus;
		if(typeof Singleton !== 'object') {
			Singleton = global.EventBus = new EventBus();
		}  

		return Singleton;
	});
})(this);
