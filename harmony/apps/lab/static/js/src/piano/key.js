define(['lodash'], function(_) {

	// constants for pano key states
	var STATE_KEYUP = 'keyup', STATE_KEYDN = 'keydown';

	/**
	 * PianoKey Class.
	 *
	 * Encapsulates functionality for displaying and interacting with piano
	 * keys on the onscreen keyboard.
	 *
	 * @constructor
	 * @this {PianoKey}
	 * @param {object} config
	 */
	var PianoKey = function() {
	};

	_.extend(PianoKey.prototype, {
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
		},

		/**
		 * Changes the piano key state to "released" (up).
		 */
		release: function() {
			this.state = STATE_KEYUP;
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
				this.calculateOffsetX(whiteKeyIndex, numWhiteKeys, keyboardWidth), 
				0, // offsetY 
				this.calculateWidth(numWhiteKeys, keyboardWidth), 
				this.calculateHeight(keyboardHeight)
			);
			this.el.mousedown(function() {
				this.attr('fill', '#739D00');
			});
			return this;
		}
	});

	/**
	 * Factory function that returns an instance of a white
	 * or black piano key.
	 *
	 * @param {boolean} isWhite True to create a white key, false for a black key.
	 * @param {string} key The string name of the key (optional).
	 * @return {PianoKey}
	 */
	PianoKey.create = function(isWhite, key) {
		if(isWhite) {
			return new WhitePianoKey(key);
		} 
		return new BlackPianoKey(key);
	};

	/**
	 * White piano key class.
	 *
	 * @constructor
	 * @this {WhitePianoKey}
	 * @param {Object} config
	 */
	var WhitePianoKey = function(key) {
		this.label = key; 
	};

	_.extend(WhitePianoKey.prototype, new PianoKey(), {
		/**
		 * Property to indicate if it's a white or black key.
		 */
		isWhite: true,

		/**
		 * Returns the width of the key.
		 *
		 * @param {integer} numWhiteKeys The total number of white keys on the keyboard.
		 * @param {number} keyboardWidth The total width of the keyboard.
		 * @return {number}
		 */
		calculateWidth: function(numWhiteKeys, keyboardWidth) {
			return keyboardWidth / numWhiteKeys;
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
		 * @param {number} keyboardWidth The total width of the keyboard.
		 * @return {number}
		 */
		calculateOffsetX: function(whiteKeyIndex, numWhiteKeys, keyboardWidth) {
			return whiteKeyIndex * this.calculateWidth(numWhiteKeys, keyboardWidth);
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
			PianoKey.prototype.render.apply(this, arguments);
			var el = this.el;
			el.attr({'stroke': '#000', 'fill': '#fff'});
			el.toBack();
			el.mouseup(function() {
				this.attr('fill', '#fff');
			});
			return this;
		}
	});

	/**
	 * Black piano key class.
	 *
	 * @constructor
	 * @this {BlackPianoKey}
	 * @param {Object} config
	 */
	var BlackPianoKey = function(key) {
		this.label = key;
	};

	_.extend(BlackPianoKey.prototype, new PianoKey(), {
		/**
		 * Property to indicate if it's a white or black key.
		 */
		isWhite: false,

		/**
		 * Returns the width of the key.
		 *
		 * @param {integer} numWhiteKeys The total number of white keys on the keyboard.
		 * @param {number} keyboardWidth The total width of the keyboard.
		 * @return {number}
		 */
		calculateWidth: function(numWhiteKeys, keyboardWidth) {
			return 0.5 * (keyboardWidth / numWhiteKeys);
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
		 * @param {number} keyboardWidth The total width of the keyboard.
		 * @return {number}
		 */
		calculateOffsetX: function(whiteKeyIndex, numWhiteKeys, keyboardWidth) {
			var offset = (whiteKeyIndex * (keyboardWidth / numWhiteKeys)); 
			var width = this.calculateWidth(numWhiteKeys, keyboardWidth);
			return offset - (0.5 * width);
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
			PianoKey.prototype.render.apply(this, arguments);
			var el = this.el;
			el.attr('fill', '90-#333-#000');
			el.toFront();
			el.mouseup(function() {
				this.attr('fill', '90-#333-#000');
			});
			return this;
		}
	});

	return PianoKey;
});
