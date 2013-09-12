/* global define: false */

define([
	'lodash',
	'app/model/event_bus'
], function(_, eventBus) {
	"use strict";

	// constants for piano key states
	var STATE_KEYUP = 'off';
	var STATE_KEYDN = 'on';

	// constants for piano key colors
	var COLOR_BLACK_KEYUP = '90-hsl(0,0,25)-hsl(0,0,0)';
	var COLOR_WHITE_KEYUP = '#fffff0';
	var COLOR_KEYDN = 'hsl(0,0,60)';
	var COLOR_KEYSUSTAINED = '90-hsla(0, 50, 40)-hsl(0,50,25)';

	/**
	 * Piano Key Mixin.
	 *
	 * Encapsulates common functionality for displaying and interacting with piano
	 * keys on the onscreen keyboard. 
	 *
	 * These properties and methods should be copied into the white/black piano key
	 * classes.
	 */
	var PianoKeyMixin = {
		/**
		 * Current state of the piano key:
		 *		up   ---> off
		 *		down ---> on
		 */
		state: STATE_KEYUP,

		/**
		 * Possible states of the piano key.
		 */
		states: [STATE_KEYUP, STATE_KEYDN],

		/**
		 * Event bus
		 */
		eventBus: eventBus,

		/**
		 * Changes the piano key state to "pressed" (down).
		 */
		press: function() {
			this.state = STATE_KEYDN;
			this.updateColor();
		},

		/**
		 * Changes the piano key state to "released" (up).
		 */
		release: function() {
			this.state = STATE_KEYUP;
			this.updateColor();
		},

		/**
		 * Returns true if the key is in the down state.
		 *
		 * @return {boolean}
		 */
		isPressed: function() {
			return this.state === STATE_KEYDN;
		},

		/**
		 * Returns true if the key is in the up state.
		 *
		 * @return {boolean}
		 */
		isReleased: function() {
			return this.state === STATE_KEYUP;
		},

		/**
		 * Initializes the piano key.
		 *
		 * @return {this}
		 */
		init: function(config) {
			if(!config.hasOwnProperty('noteNumber')) {
				throw new Error("Key must have a MIDI note number");
			}
			this.noteNumber = config.noteNumber;
			this.noteName = config.noteName || '';
			this.keyboard = config.keyboard;
			this.onPress = this.preventDefault(this.onPress);
			this.onRelease = this.preventDefault(this.onRelease);

			this.eventBus.bind('pedal', _.bind(this.onPedalChange, this));

			return this;
		},

		/**
		 * Renders the piano key on the screen.
		 * 
		 * @param {Raphael} paper Paper object from Raphael SVG library.
		 * @param {integer} whiteKeyIndex the index of the white key immediately preceding this one.
		 * @param {number} keyboardWidth the width of the keyboard
		 * @param {number} keyboardHeight the height of the keyboard
		 * @return {this}
		 */
		render: function(paper, whiteKeyIndex, numWhiteKeys, keyboardWidth, keyboardHeight) {
			this.el = paper.rect(
				this.calculateOffsetX(whiteKeyIndex), 
				0, // offsetY 
				this.calculateWidth(), 
				this.calculateHeight(keyboardHeight)
			);
			this.el.mousedown(this.onPress);
			this.el.mouseup(this.onRelease);
			this.el.mouseout(this.onRelease);
			return this;
		},

		/**
		 * Event handler for key press.
		 */
		onPress: function(e) {
			if(this.isReleased()) {
				this.press();
				this.keyboard.trigger('key', this.state, this.noteNumber);
			}
		},

		/**
		 * Event handler for key release.
		 */
		onRelease: function(e) {
			if(this.isPressed()) { 
				this.release();
				this.keyboard.trigger('key', this.state, this.noteNumber);
			}
		},

		/**
		 * Modifies keyboard properties when the sutain pedal is changed.
		 */
		onPedalChange: function(name, state) {
			if(name === 'sustain') {
				if(state === 'on') {
					// from here on out, when the key is up, it should be colored
					// to indicate that the key is sustained
					this.keyColorMap[STATE_KEYUP] = COLOR_KEYSUSTAINED;
				} else if(state === 'off') {
					this.keyColorMap[STATE_KEYUP] = this.defaultKeyColorMap[STATE_KEYUP];
					this.updateColor(); // reset colors 
				}
			}
		},

		/**
		 * Wrapper for mouse event handlers to prevent default actions.
		 */
		preventDefault: function(handler) {
			var self = this;
			return function(e) {
				e.preventDefault();
				e.stopPropagation();
				return handler.apply(self, arguments);
			};
		},

		/**
		 * Changes the color of the key depending on the state.
		 */
		updateColor: function() {
			this.el.attr('fill', this.keyColorMap[this.state]);
		},
		
		/**
		 * Destroys the key.
		 */
		destroy: function() {
			this.el.unmousedown(this.onPress);
			this.el.unmouseup(this.onRelease);
			this.el.unmouseout(this.onRelease);
		}
	};

	/**
	 * White piano key class.
	 *
	 * @constructor
	 * @this {WhitePianoKey}
	 * @param {Object} config
	 */
	var WhitePianoKey = function() {
		this.init.apply(this, arguments);
	};

	_.extend(WhitePianoKey.prototype, PianoKeyMixin, {
		/**
		 * Property to indicate if it's a white or black key.
		 */
		isWhite: true,

		/**
		 * Property for changing the key color when it's pressed or released.
		 */
		keyColorMap: {},

		/**
		 * Returns the width of the key.
		 *
		 * @param {integer} numWhiteKeys The total number of white keys on the keyboard.
		 * @param {number} keyboardWidth The total width of the keyboard.
		 * @return {number}
		 */
		calculateWidth: function() {
			return this.keyboard.keyWidth; 
		},

		/**
		 * Returns the height of the key.
		 *
		 * @param {number} keyboardHeight The height of the keyboard.
		 * @return {number}
		 */
		calculateHeight: function(keyboardHeight) {
			return keyboardHeight;
		},

		/**
		 * Returns the horizontal offset of the key on the keyboard.
		 *
		 * @param {integer} whiteKeyIndex The index of the preceding white key
		 * @return {number}
		 */
		calculateOffsetX: function(whiteKeyIndex) {
			return whiteKeyIndex * this.calculateWidth();
		},

		/**
		 * Renders the key. 
		 *
		 * @param {Raphael} paper The Raphael paper object.
		 * @param {integer} whiteKeyIndex The index of the preceding white key
		 * @param {number} keyboardWidth The total width of the keyboard.
		 * @param {number} keyboardHeight The height of the keyboard.
		 * @return {this}
		 */
		render: function(paper, whiteKeyIndex, numWhiteKeys, keyboardWidth, keyboardHeight) {
			PianoKeyMixin.render.apply(this, arguments);
			var el = this.el;
			el.attr({'stroke': '#000', 'fill': COLOR_WHITE_KEYUP});
			el.toBack();
			return this;
		}
	});

	WhitePianoKey.prototype.keyColorMap[STATE_KEYUP] = COLOR_WHITE_KEYUP;
	WhitePianoKey.prototype.keyColorMap[STATE_KEYDN] = COLOR_KEYDN;
	WhitePianoKey.prototype.defaultKeyColorMap = _.clone(WhitePianoKey.prototype.keyColorMap);

	/**
	 * Black piano key class.
	 *
	 * @constructor
	 * @this {BlackPianoKey}
	 * @param {Object} config
	 */
	var BlackPianoKey = function() {
		this.init.apply(this, arguments);
	};

	_.extend(BlackPianoKey.prototype, PianoKeyMixin, {
		/**
		 * Property to indicate if it's a white or black key.
		 */
		isWhite: false,

		/**
		 * Property for changing the key color when it's pressed or released.
		 */
		keyColorMap: {},

		/**
		 * Returns the width of the key.
		 *
		 * @param {integer} numWhiteKeys The total number of white keys on the keyboard.
		 * @param {number} keyboardWidth The total width of the keyboard.
		 * @return {number}
		 */
		calculateWidth: function() {
			return this.keyboard.keyWidth / 2;
		},

		/**
		 * Returns the height of the key.
		 *
		 * @param {number} keyboardHeight The height of the keyboard.
		 * @return {number}
		 */
		calculateHeight: function(keyboardHeight) {
			return 0.75 * keyboardHeight;
		},

		/**
		 * Returns the horizontal offset of the key on the keyboard.
		 *
		 * @param {integer} whiteKeyIndex The index of the preceding white key
		 * @return {number}
		 */
		calculateOffsetX: function(whiteKeyIndex) {
			var offset = (whiteKeyIndex * this.keyboard.keyWidth); 
			var width = this.calculateWidth();
			return offset - (width / 2);
		},

		/**
		 * Renders the key. 
		 *
		 * @param {Raphael} paper The Raphael paper object.
		 * @param {integer} whiteKeyIndex The index of the preceding white key
		 * @param {number} keyboardWidth The total width of the keyboard.
		 * @param {number} keyboardHeight The height of the keyboard.
		 * @return {this}
		 */
		render: function(paper, whiteKeyIndex, numWhiteKeys, keyboardWidth, keyboardHeight) {
			PianoKeyMixin.render.apply(this, arguments);
			var el = this.el;
			el.attr('fill', COLOR_BLACK_KEYUP);
			el.toFront();
			return this;
		}
	});

	BlackPianoKey.prototype.keyColorMap[STATE_KEYUP] = COLOR_BLACK_KEYUP;
	BlackPianoKey.prototype.keyColorMap[STATE_KEYDN] = COLOR_KEYDN; 
	BlackPianoKey.prototype.defaultKeyColorMap = _.clone(BlackPianoKey.prototype.keyColorMap);

	var PianoKey = {
		/**
		 * Factory function that returns an instance of a white
		 * or black piano key.
		 *
		 * @param {boolean} isWhite True to create a white key, false for a black key.
		 * @param {string} key The string name of the key (optional).
		 * @return {PianoKey}
		 */
		create: function(config) {
			var KeyConstructor = config.isWhite ? WhitePianoKey : BlackPianoKey;
			return new KeyConstructor(config);
		}
	};

	return PianoKey;
});
