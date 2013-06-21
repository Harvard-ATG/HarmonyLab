/**
 * Defines a global event bus.
 */
(function(global) {
	define(['microevent'], function(MicroEvent) {
		var EventBus = function() {};
		MicroEvent.mixin(EventBus);

		var eventBus = global.eventBus;
		if(typeof eventBus !== 'object') {
			eventBus = global.eventBus = new EventBus();
		}  
		return eventBus;
	});
})(this);
