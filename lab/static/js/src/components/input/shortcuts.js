define([
	'lodash',
	'app/config',
	'app/components/events',
	'app/components/component',
	'./keyboard'
], function(
	_,
	Config,
	EVENTS,
	Component,
	KeyboardInputComponent
) {

	/**
	 * Defines the keyboard shortcuts.
	 * @type {object}
	 * @const
	 */
	var SHORTS = Config.get('keyboardShortcuts');

	/**
	 * Defines whether keyboard shortcuts are enabled/disabled by default.
	 * @type {boolean}
	 */
	var KEYBOARD_SHORTCUTS_ENABLED = Config.get('general.keyboardShortcutsEnabled');

	/**
	 * This Shortcuts component is responsible for handling the
	 * shortcut logic. 
	 *
	 * It is primarily concerned with the action to take when a 
	 * shortcut is triggered. It depends on a sub-component
	 * to take keypresses and turn them into actions. 
	 *
	 * @constructor
	 */
	var KeyboardShortcutsComponent = function(settings) {
		this.settings = settings || {};

		if(this.settings.hasOwnProperty('keySignature')) {
			this.keySignature = this.settings.keySignature;
		} else {
			throw new Error("missing key signature");
		}

		this.enabled = KEYBOARD_SHORTCUTS_ENABLED;
		if(this.settings.hasOwnProperty('enabled')) {
			this.enabled = this.settings.enabled;
		} 

		this.noteAnchor = 48;
		if(SHORTS.hasOwnProperty('noteAnchor')) {
			this.noteAnchor = SHORTS.noteAnchor;
		}

		this.setComponent('input', new KeyboardInputComponent({
			keyMap: SHORTS.keyMap,
			keyCode: SHORTS.keyCode
		}));
	};

	KeyboardShortcutsComponent.prototype = new Component();

	_.extend(KeyboardShortcutsComponent.prototype, {
		/**
		 * Initializes the component.
		 *
		 * @return undefined
		 */
		initComponent: function() {
			this.messages = [
				'depressSustain',
				'retakeSustain',
				'releaseSustain',
				'rotateKeyFlatward',
				'rotateKeySharpward',
				'setKeyToNone',
				'setKeyToC',
				'toggleMetronome',
				'toggleMode',
				'clearNotes',
				'bankChord',
				'toggleNote'
			];

			this.toggleMode = this.execIf([this.isKeyDown], this.toggleMode);
			this.toggleNote = this.execIf([this.isEnabled], this.toggleNote);

			_.each(this.messages, function(msg) {
				var fn = this[msg];
				if(msg !== 'toggleNote' && msg !== 'toggleMode') {
					this["_"+msg] = fn;
					this[msg] = this.execIf([this.isEnabled, this.isKeyDown], fn);
				}
			}, this);

			_.bindAll(this, this.messages);
			_.bindAll(this, ['handleToggle']);

			this.initListeners();
		},
		/**
		 * Helper function to execute a function if every predicate
		 * returns true, otherwise cancels the action on the first
		 * one that returns false.
		 *
		 * @return {Function} a function that tests each predicate before
		 * calling the given function.
		 */
		execIf: function(predicates, fn) {
			return function() {
				var result, i, len;
				for(i = 0, len = predicates.length; i < len; i++) {
					result = predicates[i].apply(this, arguments);
					if(!result) {
						return;
					}
				}
				fn.apply(this, arguments);
			};
		},
		/**
		 * Initializes listeners on the input component.
		 *
		 * @return undefined
		 */
		initListeners: function() {
			var input = this.getComponent('input');
			_.each(this.messages, function(msg) {
				input.bind(msg, this[msg]);
			}, this);

			this.subscribe(EVENTS.BROADCAST.TOGGLE_SHORTCUTS, this.handleToggle);
		},
		/**
		 * Removes listeners on the input component.
		 *
		 * @return undefined;
		 */
		removeListeners: function() {
			var input = this.getComponent('input');
			_.each(this.messages, function(msg) {
				input.unbind(msg, this[msg]);
			}, this);

			this.unsubscribe(EVENTS.BROADCAST.TOGGLE_SHORTCUTS, this.handleToggle);
		},
		/**
		 * Enables shortcuts.
		 *
		 * @return undefined
		 */
		enable: function() {
			this.enabled = true;
		},
		/**
		 * Disables shortcuts.
		 *
		 * @return undefined
		 */
		disable: function() {
			this.enabled = false;
		},
		/**
		 * Checks if shortcuts are enabled.
		 *
		 * @return {boolean} True if enabled, false otherwise.
		 */
		isEnabled: function() {
			return this.enabled ? true : false;
		},
		/**
		 * Checks if the key is up/down.
		 *
		 * @return {boolean} True if the key is down, otherwise false.
		 */
		isKeyDown: function(state) {
			return state ? true : false;
		},
		/**
		 * Toggles the shortcut mode to enable/disable shortcuts.
		 *
		 * @return undefined
		 */
		toggleMode: function(state) {
			this.enabled = !this.enabled;
			this.broadcast(EVENTS.BROADCAST.TOGGLE_SHORTCUTS, this.enabled);
		},
		/**
		 * Handles a toggle event.
		 *
		 * @return undefined
		 */
		handleToggle: function(enabled) {
			this[enabled?'enable':'disable']();
		},
		/**
		 * Flattens the key.
		 *
		 * @return undefined
		 */
		rotateKeyFlatward: function(state) {
			this.keySignature.rotateFlatward();
		},
		/**
		 * Sharpens the key.
		 *
		 * @return undefined
		 */
		rotateKeySharpward: function(state) {
			this.keySignature.rotateSharpward();
		},
		/**
		 * Sets the key to none.
		 *
		 * @return undefined
		 */
		setKeyToNone: function(state) {
			this.keySignature.changeKey('h', true);	
		},
		setKeyToC: function(state) {
			this.keySignature.changeKey('jC_', true);	
		},
		/**
		 * Depresses the sustain pedal.
		 *
		 * @return undefined
		 */
		depressSustain: function(state) {
			this.broadcast(EVENTS.BROADCAST.PEDAL, 'sustain', 'on');
		},
		/**
		 * Releases the sustain pedal.
		 *
		 * @return undefined
		 */
		releaseSustain: function(state) {
			this.broadcast(EVENTS.BROADCAST.PEDAL, 'sustain', 'off');
		},
		/**
		 * Retakes the sustain pedal.
		 *
		 * @return undefined
		 */
		retakeSustain: function(state) {		
			if(!state) {
				return;
			}
			
			var onTimeoutDepressSustain = _.bind(function() {
				this._depressSustain();
				this.retakeTimeoutID = null;
			},this);
			
			this.retakeTimeoutID = this.retakeTimeoutID || null;
			if(this.retakeTimeoutID !== null) {
				window.clearTimeout(this.retakeTimeoutID);
			}

			this._releaseSustain();
			this.retakeTimeoutID = window.setTimeout(onTimeoutDepressSustain, 100);
		},
		/**
		 * Clears all the notes.
		 *
		 * @return undefined
		 */
		clearNotes: function(state) {
			this.broadcast(EVENTS.BROADCAST.CLEAR_NOTES);
		},
		/**
		 * Banks a chord.
		 *
		 * @return undefined
		 */
		bankChord: function(state) {
			this.broadcast(EVENTS.BROADCAST.BANK_NOTES);
		},
		/**
		 * Toggles the metronome (play and stop).
		 *
		 * @return undefined
		 */
		toggleMetronome: function(state) {
			this.broadcast(EVENTS.BROADCAST.TOGGLE_METRONOME);
		},
		/**
		 * Broadcasts a note ON/OFF event.
		 *
		 * @param {string} state
		 * @param {number} noteOffset
		 * @return undefined
		 */
		toggleNote: function(state, noteOffset) {
			var on_or_off = state ? 'on' : 'off';
			var note_value = this.calculateNote(noteOffset);
			this.broadcast(EVENTS.BROADCAST.NOTE, on_or_off, note_value);
		},
		/**
		 * Calculates the MIDI note number given a relative offset.
		 *
		 * @param {number} noteOffset
		 * @return {number} The midi note number.
		 */
		calculateNote: function(noteOffset) {
			return this.noteAnchor + noteOffset;
		}
	});

	return KeyboardShortcutsComponent;
});
