define(['lodash', 'jquery', 'app/eventbus', 'app/config'], function(_, $, eventBus, CONFIG) {

	var SHORCTUS = CONFIG.keyboardShortcuts;

	var KeyboardShortcuts = function() {
		this.init();
	};

	_.extend(KeyboardShortcuts.prototype, {
		init: function() {
			_.bindAll(this, ['onKeyDown', 'onKeyUp']);
	
			this.enabled = false;
			this.events = {
				'keydown': this.onKeyDown,
				'keyup': this.onKeyUp
			};

			$('body').on(this.events);
		},
		toggleShortcutMode: function() {
			this.enabled = !this.enabled;
		},
		noteOn: function(note) {
			eventBus.trigger('note', 'on', 60 + note);
		},
		noteOff: function(note) {
			eventBus.trigger('note', 'off', 60 + note);
		},
		onKeyDown: function(e) {
			console.log('down', e.keyCode, this.enabled ? 'enabled' : 'disabled');
		},
		onKeyUp: function(e) {
			console.log('up', e.keyCode);
		},
	});

	return KeyboardShortcuts;
});
