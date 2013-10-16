/* global define: false */
(function(global) {
	define(['microevent'], function(MicroEvent) {
		"use strict";

		/**
		 * Creates an instance of an EventBus.
		 *
		 * The event bus is intended to serve as an application-wide event
		 * distribution channel in order to decouple parts of the application.
		 *
		 * @constructor
		 * @mixes MicroEvent
		 * @global
		 */
		var EventBus = function() {};

		MicroEvent.mixin(EventBus);

		var Singleton = global.EventBus;

		if(typeof Singleton !== 'object') {
			Singleton = global.EventBus = new EventBus();
		}  

		return Singleton;
	});
})(this);
