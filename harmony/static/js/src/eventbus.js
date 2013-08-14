/* global define: false */
(function(global) {
	define(['microevent'], function(MicroEvent) {
		"use strict";
		var EventBus = function() {};
		MicroEvent.mixin(EventBus);

		var eventBus = global.eventBus;
		if(typeof eventBus !== 'object') {
			eventBus = global.eventBus = new EventBus();
		}  
		return eventBus;
	});
})(this);
