/* global define: false */
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
	 * Piano Keyboard class.
	 *
	 * @constructor
	 * @this {PianoKeyboard}
	 * @param {integer} numberOfKeys The total number of keys on the keyboard.
	 * 
	 * Example:
	 *   var keyboard = new PianoKeyboard(88);
	 *   keyboard.render();
	 *    $('#piano').append(keyboard.el);
	 */
	var PianoKeyboard = function(numberOfKeys) {
		this.init(numberOfKeys);
	};

	_.extend(PianoKeyboard.prototype, {
		/**
		 * Global event bus.
		 */
		eventBus: eventBus,

		/**
		 * Default size of the keyboard and keys.
		 */
		defaultWidth: 870,
		defaultHeight: 120,
		defaultKeyWidth: 30,

		/**
		 * Defines the number of keys on the keyboard.
		 */
		numberOfKeys: 49,

		/**
		 * Initializes the keyboard.
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

			_.bindAll(this, ['onNoteChange', 'triggerNoteChange']);

			this.initListeners();
		},

		/**
		 * Initialize listeners.
		 */
		initListeners: function() {
			this.eventBus.bind('note', this.onNoteChange);
			this.bind('key', this.triggerNoteChange);
		},

		/**
		 * Remove listeners
		 */
		removeListeners: function() {
			this.eventBus.unbind('note', this.onNoteChange);
			this.unbind('key', this.triggerNoteChange);
		},

		/**
		 * Constrain width so that the keyboard fits on screen.
		 *
		 * Note: in particular, this should force the 88-key keyboard to 
		 * shrink to fit on screen.
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
		 * Triggers a note change event to the event bus.
		 */
		triggerNoteChange: function(noteState, noteNumber, noteVelocity) {
			this.eventBus.trigger('note', noteState, noteNumber, noteVelocity);
		},

		/**
		 * Listen for note change events and updates the associated piano keys.
		 */
		onNoteChange: function(noteState, noteNumber, noteVelocity) {
			var key = this.getKeyByNumber(noteNumber);
			if(typeof key !== 'undefined') {
				key[noteState==='on'?'press':'release']();
			}
		},

		/**
		 * Returns a sequence of piano keys for the current keyboard size.
		 */
		generateKeys: function() {
			return PianoKeyGenerator.generateKeys(this.numberOfKeys, this);
		},

		/**
		 * Returns the total number of keys.
		 */
		getNumKeys: function() {
			return this.numberOfKeys;
		},

		/**
		 * Returns a key object given a note number.
		 */
		getKeyByNumber: function(noteNumber) {
			return this.keysByNumber[noteNumber];
		},

		/**
		 * Maps note numbers to keys.
		 */
		mapKeysByNumber: function(keys) {
			var noteNumbers = _.map(keys, function(key) {
				return key.noteNumber;
			});
			return _.zipObject(noteNumbers, keys);
		},

		/**
		 * Returns the total number of white keys on the keyboard.
		 *
		 * @return {integer}
		 */
		getNumWhiteKeys: function() {
			return _.filter(this.keys, function(pianoKey) {
				return pianoKey.isWhite;
			}).length;
		},

		/**
		 * Renders the keyboard.
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
		 */
		destroy: function() {
			this.removeListeners();			
			_.each(this.keys, function(key) {
				key.destroy();
			});
			this.paper.clear();
			this.keyboardEl.remove();
			this.el.remove();
		}
	});

	MicroEvent.mixin(PianoKeyboard);

	return PianoKeyboard;
});
