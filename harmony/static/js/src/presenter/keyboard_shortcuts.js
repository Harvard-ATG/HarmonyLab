/* global define: false */
define([
	'lodash', 
	'jquery', 
	'microevent',
	'app/model/event_bus', 
	'app/config'
], function(_, $, MicroEvent, eventBus, Config) {
	"use strict";

	var SHORTS = Config.get('general.keyboardShortcuts');

	var KeyboardShortcuts = function(config) {
		this.init(config);
	};

	_.extend(KeyboardShortcuts.prototype, {
		midiNote: 48, // anchor for MIDI note offsets

		enabled: false, // shortcuts mode disabled by default

		// intialization
		init: function(config) {
			if(config.hasOwnProperty('keySignature')) {
				this.keySignature = config.keySignature;
			} else {
				throw new Error("missing key signature");
			}
			if(config.hasOwnProperty('enabled')) {
				this.enabled = config.enabled;
			}

			// memoize for speed - assumes mappings are fixed
			this.mapKeyName = _.memoize(this.mapKeyName);

			this.initListeners();
		},
		// setup bindings for events
		initListeners: function() {
			this.onKeyDown = this.filterKey(this.onKeyDown);
			this.onKeyUp = this.filterKey(this.onKeyUp);

			_.bindAll(this, ['onKeyDown', 'onKeyUp', 'onKeyChange']);

			this.events = {
				'keydown': this.onKeyDown, 
				'keyup': this.onKeyUp
			};

			$('body').on(this.events);
		},
		// enables keyboard shortcuts
		enable: function() {
			this.enabled = true;
		},
		// disables keyboard shortcuts
		disable: function() {
			this.enabled = false;
		},
		// returns true if shortcuts are enabled, false otherwise
		isEnabled: function() {
			return this.enabled;
		},

		//--------------------------------------------------
		// Control shortcut functions

		// toggles shortcuts on/off
		toggleMode: function() {
			this.enabled = !this.enabled;
			this.trigger('toggle', this.enabled);
		},
		// rotates the key to one with more flats
		rotateKeyFlatward: function() {
			this.keySignature.rotateFlatward();
		},
		// rotates the key to one with more sharps
		rotateKeySharpward: function() {
			this.keySignature.rotateSharpward();
		},
		// changes the key to "none"
		setKeyToNone: function() {
			this.keySignature.changeKey('jC_', true);	
		},
		depressSustain: function() {
			eventBus.trigger('pedal', 'sustain', 'on');
		},
		releaseSustain: function() {
			eventBus.trigger('pedal', 'sustain', 'off');
		},
		retakeSustain: function() {
			this.releaseSustain();
			this.depressSustain();
		},

		//--------------------------------------------------
		// Note on/off functions

		// activate a note
		noteOn: function(noteOffset) {
			eventBus.trigger('note', 'on', this.calculateNote(noteOffset));
		},
		// deactivate a note
		noteOff: function(noteOffset) {
			eventBus.trigger('note', 'off', this.calculateNote(noteOffset));
		},
		// calculates the MIDI note given an offset 
		calculateNote: function(noteOffset) {
			return this.midiNote + noteOffset;
		},

		//--------------------------------------------------
		// Event handler functions

		// handles key down event
		onKeyDown: function(e) {
			this.onKeyChange('down', e.keyCode, e);
		},
		// handles key up event
		onKeyUp: function(e) {
			this.onKeyChange('up', e.keyCode, e);
		},
		// handles key change event
		onKeyChange: function(state, keyCode, e) {
			var mapped = this.mapKeyName(keyCode);
			switch(mapped.type) {
				case 'note':
					this[state==='down'?'noteOn':'noteOff'](mapped.value);
					e.preventDefault();
					e.stopPropagation();
					break;
				case 'control':
					if(state === 'down' && this[mapped.value]) {
						this[mapped.value]();
					}
					e.preventDefault();
					e.stopPropagation();
					break;
			}
		},
		// filters a key up/down event and skips events 
		// that aren't supported. if the event is supported,
		// passes control to a callback.
		filterKey: function(callback) {
			return function(e) {
				var keyCode = e.keyCode;
				if(!this.existsKeyCode(keyCode)) {
					return;
				} else if(!this.modeEnabled(keyCode)) {
					return;
				} else if(!this.mappedKeyName(keyCode)) {
					return;
				}
				return callback.apply(this, arguments);
			};
		},
		// returns true if the key code exists in the shortcuts table,
		// false otherwise
		existsKeyCode: function(keyCode) {
			if(SHORTS.keyCode.hasOwnProperty(keyCode)) {
				return true;
			}
			return false;
		},
		// returns true if shortcuts mode is enabled, false otherwise
		// Note: always returns true for the "toggleMode" key.
		modeEnabled: function(keyCode) {
			var mapped = this.mapKeyName(keyCode);
			if(mapped && mapped.value === 'toggleMode') {
				return true;
			}
			return this.enabled;
		},
		// returns true if the key code is mapped to an action in the
		// keyboard shortcuts table.
		mappedKeyName: function(keyCode) {
			var mapped = this.mapKeyName(keyCode);
			return mapped ? true : false;
		},

		//--------------------------------------------------
		// Utility functions

		// maps a key code to its associated entry in the shortcut table
		// returns a hash with the type of entry, name of the key, and the
		// value.
		mapKeyName: function(keyCode) {
			var key_name = SHORTS.keyCode[keyCode];
			var types = ['note', 'control'], len = types.length;
			var i, type;

			for(i = 0; i < len; i++) {
				type = types[i];
				if(SHORTS[type].hasOwnProperty(key_name)) {
					return {
						type: type, 
						name: key_name, 
						value: SHORTS[type][key_name]
					};
				}
			}

			return false;
		}
	});

	MicroEvent.mixin(KeyboardShortcuts);

	return KeyboardShortcuts;
});
