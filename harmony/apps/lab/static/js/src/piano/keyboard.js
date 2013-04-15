// NOTE: this module also requires "raphael.js" 
// There's an issue loading it with RequireJS so it is not listed as a dependency below,
// so it should be loaded on the page. 
define(['jquery', 'lodash', 'lab/piano/keygenerator', 'lab/piano/key'], function($, _, PianoKeyGenerator, PianoKey) {

	/**
	 * Piano Keyboard class.
	 *
	 * @constructor
	 * @this {PianoKeyboard}
	 * @param {integer} totalNumKeys The total number of keys on the keyboard.
	 * 
	 * Example:
	 * 	  var keyboard = new PianoKeyboard(88);
	 * 	  keyboard.render();
	 *    $('#piano').append(keyboard.el);
	 */
	var PianoKeyboard = function(totalNumKeys) {
		this.init(totalNumKeys);
	};

	_.extend(PianoKeyboard.prototype, {
		debug: true,
		width: 800,
		height: 150,
		totalNumKeys: 49,

		/**
		 * Initializes the keyboard.
		 *
		 * @param {integer} totalNumKeys The total number of keys on the keyboard.
		 */
		init: function(totalNumKeys) {
			if(_.isNumber(totalNumKeys)) {
				this.totalNumKeys = totalNumKeys;
			}
			this.el = $('<div class="keyboard"></div>');
			this.paper = Raphael(this.el.get(0), this.width, this.height);
			this.keys = this.getKeys();
		},

		/**
		 * Returns a sequence of piano keys for the current keyboard size.
		 *
		 * @return {array} of PianoKey objects.
		 */
		getKeys: function() {
			var generatedKeys = PianoKeyGenerator.generateAsBooleans(this.totalNumKeys)
			return _.map(generatedKeys, PianoKey.create);
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
