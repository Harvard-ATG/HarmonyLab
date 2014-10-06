/**
 * Piano key UI.
 */
define([
	'lodash',
	'app/components/component'
], function(
	_,
	Component
) {
	"use strict";

	/**
	 * Key up state. 
	 * @type {string}
	 * @const
	 */
	var STATE_KEYUP = 'off';
	/**
	 * Key down state.
	 * @type {string}
	 * @const
	 */
	var STATE_KEYDN = 'on';
	/**
	 * Sustain on state. 
	 * @type {string}
	 * @const
	 */
	var SUSTAIN_ON = 'on';
	/**
	 * Sustain off state.
	 * @type {string}
	 * @const
	 */
	var SUSTAIN_OFF = 'off';
	/**
	 * Black key up state.
	 * @type {string}
	 * @const
	 */
	var COLOR_BLACK_KEYUP = '90-hsl(0,0,25)-hsl(0,0,0)';
	/**
	 * White key up state.
	 * @type {string}
	 * @const
	 */
	var COLOR_WHITE_KEYUP = '#fffff0';
	/**
	 * Key down state.
	 * @type {string}
	 * @const
	 */
	var COLOR_KEYDN = 'hsl(0,0,60)';
	/**
	 * Key sustain state.
	 * @type {string}
	 * @const
	 */
	var COLOR_KEYSUSTAIN = '90-hsla(0, 30, 40)-hsl(0,45,20)';

	/**
	 * Piano Key Mixin.
	 *
	 * Encapsulates common functionality for displaying and interacting with piano
	 * keys on the onscreen keyboard. 
	 *
	 * @mixin
	 */
	var PianoKeyMixin = {
		/**
		 * Current state of the piano key (up or down).
		 */
		state: STATE_KEYUP,
		/**
		 * Sustain flag used to change the coloring of the key
		 * when it is released to indicate that it is being sustained.
		 */
		sustain: SUSTAIN_OFF,
		/**
		 * Changes the piano key state to "pressed" (down).
		 *
		 * @return undefined
		 */
		press: function() {
			this.state = STATE_KEYDN;
			this.updateColor();
		},
		/**
		 * Changes the piano key state to "released" (up).
		 *
		 * @return undefined
		 */
		release: function() {
			switch(this.sustain) {
				case SUSTAIN_ON: 
					this.setColor(STATE_KEYUP, COLOR_KEYSUSTAIN);
					break;
				case SUSTAIN_OFF: 
					this.revertColor(STATE_KEYUP);
					break;
				default:
					this.revertColor(STATE_KEYUP);
			}

			this.state = STATE_KEYUP;
			this.updateColor();
		},
		/**
		 * Clears the key.
		 *
		 * @return undefined
		 */
		clear: function() {
			this.revertColor(STATE_KEYUP);
			this.state = STATE_KEYUP;
			this.updateColor();
		},
		/**
		 * Sets the sustain on the key so that when the key is released
		 * it will know to sustain it. 
		 *
		 * Note that when the sustain is turned off, this method automatically
		 * calls the release() method to revert it back to the normal release
		 * state.
		 *
		 * @param {boolean} state When true, enable sustain, otherwise disable.
		 * @return undefined
		 */
		setSustain: function(state) {
			if(state) {
				this.sustain = SUSTAIN_ON;
				if(this.isPressed()) {
					this.sustain = SUSTAIN_ON;
				}
			} else {
				this.sustain = SUSTAIN_OFF;
				if(this.isReleased()) {
					this.release();
				}
			}
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
		 * @return undefined
		 */
		initComponent: function() {
			if(!("noteNumber" in this.settings)) {
				throw new Error("Key must have a MIDI note number");
			}
			if(!("whiteKeyIndex" in this.settings)) {
				throw new Error("Key must know its white key index");
			}

			this.noteNumber = this.settings.noteNumber;
			this.whiteKeyIndex = this.settings.whiteKeyIndex;

			_.bindAll(this, ['onPress', 'onRelease']);
		},
		/**
		 * Renders the piano key on the screen.
		 * 
		 * @param {Raphael} paper Paper object from Raphael SVG library.
		 * @param {number} keyWidth the width of the key
		 * @param {number} keyboardWidth the width of the keyboard
		 * @param {number} keyboardHeight the height of the keyboard
		 * @return this
		 */
		render: function(paper, keyWidth, keyboardWidth, keyboardHeight) {
			this.keyWidth = keyWidth;
			this.el = paper.rect(
				this.calculateOffsetX(), 
				0, // offsetY 
				this.calculateWidth(), 
				this.calculateHeight(keyboardHeight)
			);
			this.el.mousedown(this.onPress);
			this.el.mouseup(this.onRelease);
			this.el.mouseout(this.onRelease);
			this.rendered = true;
			return this;
		},
		/**
		 * Event handler for key press.
		 *
		 * When the key is pressed via right-click, the usual context 
		 * menu and action should be prevented.
		 *
		 * @return {boolean}
		 */
		onPress: function(e) {
			var is_right_click = (e.button == 2);
			if(this.isReleased()) {
				this.press();
				if(is_right_click) {
					e.preventDefault();
					e.stopPropagation();
				} else {
					this.parentComponent.trigger('key', this.state, this.noteNumber);
				}
			} 

			return false;
		},
		/**
		 * Event handler for key release.
		 *
		 * When right click is detected, should release the key
		 * even if sustained.
		 *
		 * @return {boolean}
		 */
		onRelease: function(e) {
			var is_right_click = (e.button == 2);
			var sustain = this.sustain;
			if(this.isPressed()) { 
				if(is_right_click) {
					this.setSustain(false);
				}
				this.release();
				this.parentComponent.trigger('key', this.state, this.noteNumber, {overrideSustain: is_right_click});
				if(is_right_click) {
					this.setSustain(sustain);
				}
			}
			return false;
		},
		/**
		 * Update the element color.
		 *
		 * @return undefined
		 */
		updateColor: function() {
			this.el.attr('fill', this.keyColorMap[this.state]);
		},
		/**
		 * Reverts the color for a particular key state to the default.
		 *
		 * @param {string} keyState
		 * @return undefined
		 */
		revertColor: function(keyState) {
			this.keyColorMap[keyState] = this.defaultKeyColorMap[keyState];
		},
		/**
		 * Sets the color for a particular key state.
		 *
		 * @param {string} keyState
		 * @param {string} color 
		 * @return undefined
		 */
		setColor: function(keyState, color) {
			this.keyColorMap[keyState] = color;
		},
		/**
		 * Destroys the key.
		 *
		 * @return undefined
		 */
		destroy: function() {
			if(this.rendered) {
				this.el.unmousedown(this.onPress);
				this.el.unmouseup(this.onRelease);
				this.el.unmouseout(this.onRelease);
			}
		}
	};

	/**
	 * Creates an instance of a white piano key. 
	 *
	 * @constructor
	 * @param {Object} config
	 */
	var WhitePianoKey = function(settings) {
		this.settings = settings || {};
	};

	WhitePianoKey.prototype = new Component();

	_.extend(WhitePianoKey.prototype, PianoKeyMixin, {
		/**
		 * Key color flag, when true means it's a white key.
		 * @type {boolean}
		 */
		isWhite: true,
		/**
		 * Maps states to colors. 
		 * @type {object}
		 */
		keyColorMap: {},
		/**
		 * Returns the width of the key.
		 *
		 * @return {number}
		 */
		calculateWidth: function() {
			return this.keyWidth; 
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
		 * @return {number}
		 */
		calculateOffsetX: function() {
			return this.whiteKeyIndex * this.calculateWidth();
		},
		/**
		 * Renders the key. 
		 *
		 * @param {Raphael} paper The Raphael paper object.
		 * @param {number} keyWidth the width of the key
		 * @param {number} keyboardWidth The total width of the keyboard.
		 * @param {number} keyboardHeight The height of the keyboard.
		 * @return this
		 */
		render: function(paper, keyWidth, keyboardWidth, keyboardHeight) {
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
	 * Creates an instance of a black key.
	 *
	 * @constructor
	 * @param {Object} config
	 */
	var BlackPianoKey = function(settings) {
		this.settings = settings || {};
	};

	BlackPianoKey.prototype = new Component();

	_.extend(BlackPianoKey.prototype, PianoKeyMixin, {
		/**
		 * Flag, when true indicates the key is white, otherwise black.
		 * @type {object}
		 */
		isWhite: false,
		/**
		 * Maps states to colors.
		 * @type {object}
		 */
		keyColorMap: {},
		/**
		 * Returns the width of the key.
		 *
		 * @return {number}
		 */
		calculateWidth: function() {
			return this.keyWidth / 2;
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
		 * @return {number}
		 */
		calculateOffsetX: function() {
			var offset = (this.whiteKeyIndex * this.keyWidth); 
			var width = this.calculateWidth();
			return offset - (width / 2);
		},
		/**
		 * Renders the key. 
		 *
		 * @param {Raphael} paper The Raphael paper object.
		 * @param {number} keyWidth the width of the key
		 * @param {number} keyboardWidth The total width of the keyboard.
		 * @param {number} keyboardHeight The height of the keyboard.
		 * @return this
		 */
		render: function(paper,  keyWidth, keyboardWidth, keyboardHeight) {
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

	var PianoKeyFactory = {
		/**
		 * Factory function that returns an instance of a white
		 * or black piano key.
		 *
		 * @param {boolean} isWhite True to create a white key, false for a black key.
		 * @param {string} key The string name of the key (optional).
		 * @return {PianoKey}
		 */
		create: function(settings) {
			var KeyConstructor = settings.isWhite ? WhitePianoKey : BlackPianoKey;
			return new KeyConstructor(settings);
		}
	};

	return PianoKeyFactory;
});
