/* global define: false */
define([
	'lodash', 
	'jquery', 
	'microevent',
	'app/model/event_bus', 
	'app/config'
], function(_, $, MicroEvent, eventBus, Config) {
	"use strict";

	var SHORTS = Config.get('keyboardShortcuts');

	var KeyboardShortcuts = function(config) {
		this.init(config);
	};

	_.extend(KeyboardShortcuts.prototype, {

		eventBus: eventBus, // reference to the global event bus

		enabled: false, // shortcuts mode disabled by default

		keyState: {}, // maps keyCode -> true|false (true=down, false=up)

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
			this.onKeyDown = this.overrideKey(this.onKeyDown);
			this.onKeyUp = this.overrideKey(this.onKeyUp);

			_.bindAll(this, ['onKeyDown', 'onKeyUp', 'onKeyChange']);

			this.events = {
				'keydown': this.onKeyDown, 
				'keyup': this.onKeyUp
			};

			$('body').on(this.events);
		},
		// remove bindings for events
		removeListeners: function() {
			$('body').off(this.events);
		},
		// destroy this object
		destroy: function() {
			this.removeListeners();
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
			this.eventBus.trigger('pedal', 'sustain', 'on');
		},
		releaseSustain: function() {
			this.eventBus.trigger('pedal', 'sustain', 'off');
		},
		retakeSustain: function() {
			this.releaseSustain();
			this.depressSustain();
		},
		// clears the notes 
		clearNotes: function() {
			this.eventBus.trigger('clearnotes');
		},
		// banks a chord
		bankChord: function() {
			this.eventBus.trigger('banknotes');
		},

		//--------------------------------------------------
		// Note on/off functions

		// activate a note
		noteOn: function(noteOffset) {
			this.eventBus.trigger('note', 'on', this.calculateNote(noteOffset));
		},
		// deactivate a note
		noteOff: function(noteOffset) {
			this.eventBus.trigger('note', 'off', this.calculateNote(noteOffset));
		},
		// calculates the MIDI note given an offset 
		calculateNote: function(noteOffset) {
			return SHORTS.noteAnchor + noteOffset;
		},

		//--------------------------------------------------
		// Event handler functions

		// handles key down event
		onKeyDown: function(e) {
			// skip repeated keydowns (chrome repeats keydown events)
			if(this.keyState[e.keyCode]) {
				return false;
			}
			this.keyState[e.keyCode] = true;
			this.onKeyChange('down', e.keyCode, e);
		},
		// handles key up event
		onKeyUp: function(e) {
			this.keyState[e.keyCode] = false;
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
		// overrides key up/down events if they are supported
		// and passes control to the provided callback, otherwise 
		// lets the event propagate and do the default action as expected
		overrideKey: function(callback) {
			return function(e) {
				var keyCode = e.keyCode;
				var target = e.target;

				if(this.isModifierKey(e)) {
					return true; // skip alt/ctrl/meta key combos
				} else if(this.isInputElement(target)) {
					return true; // skip if the target of the key event is an input 
				} else if(!this.existsKeyCode(keyCode)) {
					return true; // skip if not supported
				} else if(!this.modeEnabled(keyCode)) {
					return true; // skip if mode not enabled
				} else if(!this.mappedKeyName(keyCode)) {
					return true; // skip if there's no action mapping 
				}

				return callback.apply(this, arguments);
			};
		},
		// returns true if the passed dom node is an input element, false
		// otherwise.
		isInputElement: function(node) {
			return node.nodeName === 'INPUT';
		},
		// returns true if the event indicates that the key is an alt, ctrl, or
		// meta key (i.e. "modifier" key), otherwise false.
		isModifierKey: function(keyEvent) {
			return (keyEvent.altKey || keyEvent.ctrlKey || keyEvent.metaKey) ? true : false;
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
