/**
 * @fileoverview Piano keyboard UI.
 */
define([
	'jquery', 
	'lodash', 
	'microevent',
	'raphael',
	'app/model/event_bus',
	'app/view/piano/piano_key_generator', 
	'app/view/piano/piano_key'
], function(
	$, 
	_, 
	MicroEvent, 
	Raphael,
	eventBus, 
	PianoKeyGenerator, 
	PianoKey
) {
	"use strict";

	/**
	 * Creates an instance of a PianoKeyboard.
	 *
	 * This object is reponsible for displaying the on-screen keyboard UI that
	 * users can interact with. It is composed of a number of PianoKey objects. 
	 *
	 * The PianoKeyboard coordinates the flow of NOTE ON/OFF messages and
	 * translates them to/from individual keys.
	 *
	 * @constructor
	 * @mixes MicroEvent
	 * @param {integer} numberOfKeys The total number of keys on the keyboard.
	 */
	var PianoKeyboard = function(numberOfKeys) {
		this.init(numberOfKeys);
	};

	_.extend(PianoKeyboard.prototype, {
		/**
		 * Global event bus.
		 * @type {object}
		 */
		eventBus: eventBus,
		/**
		 * Defines the default width of the keyboard.
		 * @type {number}
		 */
		defaultWidth: 870,
		/**
		 * Defines the default height of the keyboard.
		 * @type {number}
		 */
		defaultHeight: 120,
		/**
		 * Defines the default width of individual keys. 
		 * @type {number}
		 */
		defaultKeyWidth: 30,
		/**
		 * Defines the number of keys on the keyboard.
		 * @type {number}
		 */
		numberOfKeys: 49,
		/**
		 * Initializes the keyboard.
		 *
		 * @param {number} numberOfKeys
		 * @return undefined
		 */
		init: function(numberOfKeys) {
			if(!_.isUndefined(numberOfKeys) && _.isNumber(parseInt(numberOfKeys,10))) {
				this.numberOfKeys = parseInt(numberOfKeys, 10);
			}

			this.el = $('<div class="keyboard-area"><div class="keyboard"></div></div>');
			this.keyboardEl = $('.keyboard', this.el);
			this.keys = this.generateKeys() || [];
			this.keysByNumber = this.mapKeysByNumber(this.keys);

			this.constrainSize();

			this.paper = Raphael(this.keyboardEl.get(0), this.width, this.height);

			_.bindAll(this, [
				'onPedalChange', 
				'onNoteChange', 
				'onClearNotes',
				'triggerNoteChange'
			]);

			this.initListeners();
		},
		/**
		 * Initialize listeners.
		 *
		 * @return undefined
		 */
		initListeners: function() {
			this.eventBus.bind('note', this.onNoteChange);
			this.eventBus.bind('clearnotes', this.onClearNotes);
			this.eventBus.bind('pedal', this.onPedalChange);
			this.bind('key', this.triggerNoteChange);
		},
		/**
		 * Removes all listeners.
		 *
		 * @return undefined
		 */
		removeListeners: function() {
			this.eventBus.unbind('note', this.onNoteChange);
			this.eventBus.unbind('clearnotes', this.onClearNotes);
			this.eventBus.unbind('pedal', this.onPedalChange);
			this.unbind('key', this.triggerNoteChange);
		},
		/**
		 * Constrains the width so that the keyboard fits on screen.
		 *
		 * Note: in particular, this should force the 88-key keyboard to 
		 * shrink to fit on screen.
		 *
		 * @return undefined
		 */
		constrainSize: function() {
			this.height = this.defaultHeight;

			if(this.defaultWidth >= this.getNumWhiteKeys() * this.defaultKeyWidth) {
				this.width = (this.getNumWhiteKeys() * this.defaultKeyWidth);
				this.keyWidth = this.defaultKeyWidth;
			} else {
				this.width = this.defaultWidth;
				this.keyWidth = (this.defaultWidth / this.getNumWhiteKeys());
			}
		},
		/**
		 * Fires a note change event on the event bus.
		 *
		 * @return undefined
		 */
		triggerNoteChange: function() {
			var args = Array.prototype.slice.call(arguments);
			args.unshift('note');
			this.eventBus.trigger.apply(this.eventBus, args);
		},
		/**
		 * Listens for note change events from the event bus.
		 * Performs the associated action (press/release) on the key with 
		 * that note number.
		 *
		 * @return undefined
		 */
		onNoteChange: function(noteState, noteNumber, noteVelocity) {
			var key = this.getKeyByNumber(noteNumber);
			if(typeof key !== 'undefined') {
				key[noteState==='on'?'press':'release']();
			}
		},
		/**
		 * Clears all keys.
		 *
		 * @return undefined
		 */
		onClearNotes: function() {
			this.clearKeys();
		},
		/*
		 * Handles pedal changes.
		 *
		 * @return undefined
		 */
		onPedalChange: function(pedal, state) {
			if(pedal === 'sustain') { 
				var is_sustained = (state === 'on');
				_.each(this.keys, function(key) {
					key.setSustain(is_sustained);
				});
			}
		},
		/**
		 * Generates a *new* sequence of piano keys for the current keyboard size.
		 *
		 * @return {array}
		 */
		generateKeys: function() {
			return PianoKeyGenerator.generateKeys(this.numberOfKeys, this);
		},
		/**
		 * Clears each piano key.
		 *
		 * @return undefined
		 */
		clearKeys: function() {
			_.invoke(this.keys, 'clear');
		},
		/**
		 * Returns the total number of keys.
		 *
		 * @return {number}
		 */
		getNumKeys: function() {
			return this.numberOfKeys;
		},
		/**
		 * Returns a key object given a note number.
		 *
		 * @return {PianoKey}
		 */
		getKeyByNumber: function(noteNumber) {
			return this.keysByNumber[noteNumber];
		},
		/**
		 * Maps note numbers to keys.
		 *
		 * @return {object}
		 */
		mapKeysByNumber: function(keys) {
			return _.zipObject(_.pluck(keys, 'noteNumber'), keys);
		},
		/**
		 * Returns the total number of white keys on the keyboard.
		 *
		 * @return {number}
		 */
		getNumWhiteKeys: function() {
			return _.filter(this.keys, function(key) {
				return key.isWhite;
			}).length;
		},
		/**
		 * Renders the keyboard.
		 *
		 * @return this
		 */
		render: function() {
			var paper = this.paper;
			var width = this.width;
			var height = this.height;
			var keys = this.keys;
			var numWhiteKeys = this.getNumWhiteKeys();

			// render keyboard
			var keyboardEl = paper.rect(0, 0, width, height);
			keyboardEl.attr('stroke-width', 2);

			// render piano keys 
			var whiteKeyIndex = 0;
			_.each(this.keys, function(pianoKey, index) {
				pianoKey.render(paper, whiteKeyIndex, numWhiteKeys, width, height);
				if(pianoKey.isWhite) {
					whiteKeyIndex++;
				}
			});

			return this;
		},
		/**
		 * Destroys the keyboard.
		 * 
		 * @return undefined
		 */
		destroy: function() {
			this.removeListeners();			
			_.invoke(this.keys, 'destroy');
			this.paper.clear();
			this.keyboardEl.remove();
			this.el.remove();
		}
	});

	MicroEvent.mixin(PianoKeyboard);

	return PianoKeyboard;
});
