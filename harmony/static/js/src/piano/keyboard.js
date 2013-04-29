// NOTE: this module also requires "raphael.js" (loaded synchronously - AMD issues)
define([
	'jquery', 
	'lodash', 
	'radio',
	'./keygenerator', 
	'./key'
], function($, _, radio, PianoKeyGenerator, PianoKey) {

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
		 * Size of the keyboard on screen.
		 *
		 * @property {integer} width
		 * @property {integer} height
		 */
		width: 800,
		height: 150,

		/**
		 * Defines the number of keys on the keyboard.
		 *
		 * @property {integer} numberOfKeys
		 */
		numberOfKeys: 49,

		/**
		 * Initializes the keyboard.
		 *
		 * @param {integer} numberOfKeys The total number of keys on the keyboard.
		 */
		init: function(numberOfKeys) {
			if(!_.isUndefined(numberOfKeys) && _.isNumber(parseInt(numberOfKeys,10))) {
				this.numberOfKeys = parseInt(numberOfKeys, 10);
			}

			this.el = $('<div class="keyboard"></div>');
			this.keys = this.getKeys() || [];
			this.width = (this.getNumWhiteKeys() * PianoKey.width);
			this.paper = Raphael(this.el.get(0), this.width, this.height);
		},

		/**
		 * Returns a sequence of piano keys for the current keyboard size.
		 *
		 * @return {array} of PianoKey objects.
		 */
		getKeys: function() {
			return PianoKeyGenerator.generateKeys(this.numberOfKeys);
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
			this._render();
			return this;
		},

		// Helper function for rendering.
		_render: function() {
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
		}
	});

	return PianoKeyboard;
});
