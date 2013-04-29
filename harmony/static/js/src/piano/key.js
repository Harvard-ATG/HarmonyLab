define(['lodash', 'radio'], function(_, radio) {

	// constants for piano key states
	var STATE_KEYUP = 'keyup', STATE_KEYDN = 'keydown';

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
		 * Reference to the radio event bus.
		 */
		radio: radio,

		/**
		 * Current state of the piano key (up or down).
		 */
		state: STATE_KEYUP,

		/**
		 * Possible states of the piano key.
		 */
		states: [STATE_KEYUP, STATE_KEYDN],

		/**
		 * Changes the piano key state to "pressed" (down).
		 */
		press: function() {
			this.state = STATE_KEYDN;
			this.updateColor();
			this.radio('note').broadcast('on', this.noteNumber);
		},

		/**
		 * Changes the piano key state to "released" (up).
		 */
		release: function() {
			this.state = STATE_KEYUP;
			this.updateColor();
			this.radio('note').broadcast('off', this.noteNumber);
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
			this.onPress = _.bind(this.onPress, this);
			this.onRelease = _.bind(this.onRelease, this);
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
			return this;
		},

		/**
		 * Event handler for key press.
		 */
		onPress: function() {
			this.press();
		},

		/**
		 * Event handler for key press.
		 */
		onRelease: function() {
			this.release();
		},

		/**
		 * Changes the color of the key depending on the state.
		 */
		updateColor: function() {
			this.el.attr('fill', this.keyColorMap[this.state]);
		},
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
			return PianoKey.width; 
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
			el.attr({'stroke': '#000', 'fill': '#fffff0'});
			el.toBack();
			el.mouseup(this.onRelease);
			el.mouseout(this.onRelease);
			return this;
		},
	});

	WhitePianoKey.prototype.keyColorMap[STATE_KEYUP] = '#fffff0';
	WhitePianoKey.prototype.keyColorMap[STATE_KEYDN] = '#aaa';

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
			return PianoKey.width / 2;
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
			var offset = (whiteKeyIndex * PianoKey.width); 
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
			el.attr('fill', '90-#333-#000');
			el.toFront();
			el.mouseup(this.onRelease);
			el.mouseout(this.onRelease);
			return this;
		}
	});

	BlackPianoKey.prototype.keyColorMap[STATE_KEYUP] = '90-#333-#000',
	BlackPianoKey.prototype.keyColorMap[STATE_KEYDN] = '#aaa';

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
			var constructor = config.isWhite ? WhitePianoKey : BlackPianoKey;
			return new constructor(config);
		},

		/**
		 * The width a white piano key.
		 */
		width: 30
	};

	return PianoKey;
});
