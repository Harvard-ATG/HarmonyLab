/* global define: false */
define([
	'lodash', 
	'jquery', 
	'microevent',
	'app/model/event_bus', 
	'app/config'
], function(
	_, 
	$, 
	MicroEvent, 
	eventBus, 
	Config
) {
	"use strict";

	/**
	 * Defines the keyboard shortcuts.
	 * @type {object}
	 * @const
	 */
	var SHORTS = Config.get('keyboardShortcuts');

	/**
	 * Creates an instance of KeyboardShortcuts.
	 *
	 * @constructor
	 * @param {object} config
	 * @param {object} config.keySignature Requires the KeySignature object.
	 * @param {object} config.enabled Optionally set enabled.
	 * @mixes MicroEvent
	 * @fires toggle
	 */
	var KeyboardShortcuts = function(config) {
		/**
		 * Reference to the event bus.
		 * @type {object} 
		 * @protected
		 */
		this.eventBus = eventBus;
		/**
		 * Enables keyboard shortcuts when true.
		 * @type {boolean}
		 * @default false
		 * @protected
		 */
		this.enabled = false;
		/**
		 * Maps a keyCode to true|false. When true, the key is down, otherwise
		 * the key is up.
		 * @type {object}
		 * @protected
		 */
		this.keyState = {};

		this.init(config);
	};

	_.extend(KeyboardShortcuts.prototype, {
		/**
		 * Initializes the shortcuts.
		 *
		 * @param {object} config
		 * @return undefined
		 * @throws {Error} Will throw an error if keySignature is missing from
		 * the config.
		 */
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
		/**
		 * Initializes listeners for key up/down events.
		 *
		 * @return undefined
		 */
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
		/**
		 * Removes listeners for key up/down events.
		 *
		 * @return undefined
		 */
		removeListeners: function() {
			$('body').off(this.events);
		},
		/**
		 * Destroys this object.
		 *
		 * @return undefined
		 */
		destroy: function() {
			this.removeListeners();
		},
		/**
		 * Enables keyboard shortcuts.
		 *
		 * @return undefined
		 */
		enable: function() {
			this.enabled = true;
		},
		/**
		 * Disables keyboard shortcuts.
		 *
		 * @return undefined
		 */
		disable: function() {
			this.enabled = false;
		},
		/**
		 * Returns true when shortcuts are enabled, false otherwise.
		 *
		 * @return {boolean}
		 */
		isEnabled: function() {
			return this.enabled;
		},

		//--------------------------------------------------
		// Control shortcut functions

		/**
		 * Toggles shortcuts on/off.
		 *
		 * @return undefined
		 * @fires toggle
		 */
		toggleMode: function() {
			this.enabled = !this.enabled;
			this.trigger('toggle', this.enabled);
		},
		/**
		 * Flattens the key.
		 *
		 * @return undefined
		 */
		rotateKeyFlatward: function() {
			this.keySignature.rotateFlatward();
		},
		/**
		 * Sharpens the key.
		 *
		 * @return undefined
		 */
		rotateKeySharpward: function() {
			this.keySignature.rotateSharpward();
		},
		/**
		 * Sets the key to none.
		 *
		 * @return undefined
		 */
		setKeyToNone: function() {
			this.keySignature.changeKey('jC_', true);	
		},
		/**
		 * Depresses the sustain pedal.
		 *
		 * @return undefined
		 */
		depressSustain: function() {
			this.eventBus.trigger('pedal', 'sustain', 'on');
		},
		/**
		 * Releases the sustain pedal.
		 *
		 * @return undefined
		 */
		releaseSustain: function() {
			this.eventBus.trigger('pedal', 'sustain', 'off');
		},
		/**
		 * Retakes the sustain pedal.
		 *
		 * @return undefined
		 */
		retakeSustain: function() {
			this.releaseSustain();
			this.depressSustain();
		},
		/**
		 * Clears all the notes.
		 *
		 * @return undefined
		 */
		clearNotes: function() {
			this.eventBus.trigger('clearnotes');
		},
		/**
		 * Banks a chord.
		 *
		 * @return undefined
		 */
		bankChord: function() {
			this.eventBus.trigger('banknotes');
		},

		//--------------------------------------------------
		// Note on/off functions

		/**
		 * Turns a note on.
		 *
		 * @param {number} noteOffset
		 * @return undefined
		 */
		noteOn: function(noteOffset) {
			this.eventBus.trigger('note', 'on', this.calculateNote(noteOffset));
		},
		/**
		 * Truns a note off
		 *
		 * @param {number} noteOffset
		 * @return undefined
		 */
		noteOff: function(noteOffset) {
			this.eventBus.trigger('note', 'off', this.calculateNote(noteOffset));
		},
		/**
		 * Calculates the MIDI note number given a relative offset.
		 *
		 * @param {number} noteOffset
		 * @return {number} The midi note number.
		 */
		calculateNote: function(noteOffset) {
			return SHORTS.noteAnchor + noteOffset;
		},

		//--------------------------------------------------
		// Event handler functions

		/**
		 * Handles a keydown event.
		 *
		 * @param {object} e
		 * @return undefined
		 */
		onKeyDown: function(e) {
			// skip repeated keydowns (chrome repeats keydown events)
			if(this.keyState[e.keyCode]) {
				return false;
			}
			this.keyState[e.keyCode] = true;
			this.onKeyChange('down', e.keyCode, e);
		},
		/**
		 * Handles a keyup event.
		 *
		 * @param e
		 * @return undefined
		 */
		onKeyUp: function(e) {
			this.keyState[e.keyCode] = false;
			this.onKeyChange('up', e.keyCode, e);
		},
		/**
		 * Handles a key change event.
		 *
		 * @param {string} state up|down
		 * @param {number} keyCode
		 * @param {object} e
		 * @return undefined
		 */
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
		/**
		 * Overrides up/down key events if they are supported and passes control
		 * to the provided callback, otherwise lets the event propagate as
		 * normal and execute the default action.
		 *
		 * @param {function} callback
		 * @return {boolean}
		 */
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
		/**
		 * Returns true if the passed dom node is an input element, false
		 * otherwise.
		 *
		 * @param {object} node
		 * @return {boolean}
		 */
		isInputElement: function(node) {
			return node.nodeName === 'INPUT';
		},
		/**
		 * Returns true if the event indicates that the key is an alt, ctrl, or
		 * meta key (i.e. "modifier" key), otherwise false.
		 *
		 * @param {object} keyEvent
		 * @return {boolean}
		 */
		isModifierKey: function(keyEvent) {
			return (keyEvent.altKey || keyEvent.ctrlKey || keyEvent.metaKey) ? true : false;
		},
		/**
		 * Returns true if the key code exists in the shortcuts table,
		 * false otherwise
		 *
		 * @param {number} keyCode
		 * @return {boolean}
		 */
		existsKeyCode: function(keyCode) {
			if(SHORTS.keyCode.hasOwnProperty(keyCode)) {
				return true;
			}
			return false;
		},
		/**
		 * Returns true if shortcuts mode is enabled, false otherwise
		 * Note: always returns true for the "toggleMode" key.
		 *
		 * @param {number} keyCode
		 * @return {boolean}
		 */
		modeEnabled: function(keyCode) {
			var mapped = this.mapKeyName(keyCode);
			if(mapped && mapped.value === 'toggleMode') {
				return true;
			}
			return this.enabled;
		},
		/**
		 * Returns true if the key code is mapped to an action in the
		 * keyboard shortcuts table.
		 *
		 * @param {number} keyCode
		 * @return {boolean}
		 */
		mappedKeyName: function(keyCode) {
			var mapped = this.mapKeyName(keyCode);
			return mapped ? true : false;
		},

		//--------------------------------------------------
		// Utility functions

		/**
		 * Maps a key code to its associated entry in the shortcut table
		 * returns a hash with the type of entry, name of the key, and the
		 * value.
		 *
		 * @param {number} keyCode
		 * @return {object} 
		 */
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
