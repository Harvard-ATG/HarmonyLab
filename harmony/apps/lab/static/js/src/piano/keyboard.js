// Note: also requires "raphael" (issue with requirejs, so loaded manually, not with requirejs)
define(['jquery', 'lodash', 'lab/piano/keyrenderer'], function($, _, KeyRenderer) {

	// Keyboard constructor function.
	// 
	// Usage: 
	//
	//	var keyboard = new Keyboard(88);
	//	keyboard.render();
	//	$('#piano').append(keyboard.el);
	//
	var Keyboard = function(numKeys) {
		this.init(numKeys);
	};

	_.extend(Keyboard.prototype, {
		// For debugging.
		debug: true,

		// Dimensions of the keyboard.
		width: function() {
			return 800;
		},
		height: function() {
			return 150
		},

		// White keys may represent one of 7 possible notes in the musical alphabet. 
		whiteKeys: 'ABCDEFG',

		// Black keys represent half steps between the main notes (sharp or flat).
		blackKey: '-',

		// Black keys are arranged in groups of 2's and 3's and appear after some white keys.
		blackKeysAfter: 'ACDFG',

		// Number of keys on the keyboard
		numKeys: 49,

		// Maps valid keyboard sizes to configuration parameters. 
		keyboardSizes: {
			25: { 'firstNote': 'C' }, 
			37: { 'firstNote': 'C' }, 
			49: { 'firstNote': 'C' }, 
			61: { 'firstNote': 'C' }, 
			76: { 'firstNote': 'E' }, 
			88: { 'firstNote': 'A' }
		},

		// Initialize the keyboard object.
		init: function(numKeys) {
			if(typeof numKeys !== 'undefined') {
				if(!this.keyboardSizes.hasOwnProperty(this.numKeys)) {
					throw new Error("Invalid keyboard size");
				}
				this.numKeys = numKeys;
			}

			this.el = $('<div class="keyboard"></div>');

			if(this.debug) {
				console.log(Raphael);
			}

			this.paper = Raphael(this.el.get(0), this.width(), this.height());
		},

		// Returns the next white key note in the musical alphabet. 
		nextWhiteKey: function(whiteKey) {
			var index = this.whiteKeys.indexOf(whiteKey);
			if(index === -1) {
				throw new Error("Invalid key.");
			}
			return this.whiteKeys.charAt((index + 1) % this.whiteKeys.length);
		},

		// Returns a sequence of white and black keys for a given size.
		generateKeys: function(whiteKey, size) {
			var nextWhiteKey = this.nextWhiteKey(whiteKey);
			if(size == 0) {
				return [];
			} else if(size > 1 && this.blackKeysAfter.indexOf(whiteKey) !== -1) {
				return [whiteKey, this.blackKey].concat(this.generateKeys(nextWhiteKey, size - 2));
			} 
			return [whiteKey].concat(this.generateKeys(nextWhiteKey, size - 1));
		},

		// Returns the first note for the current keyboard size.
		getFirstNote: function() {
			return this.keyboardSizes[this.numKeys]['firstNote'];
		},

		// Returns a key sequence for the keyboard.
		getKeys: function() {
			return this.generateKeys(this.getFirstNote(), this.numKeys);
		},

		// Returns true if the key is white, otherwise false.
		isWhiteKey: function(key) { 
			return key !== this.blackKey; 
		},
		
		// Returns true if the key is black, otherwise false.
		isBlackKey: function(key) {
			return key === this.blackKey;
		},

		// Filters a list of keys by white/black.
		filterKeys: function(keys, type) {
			var filterBy = (type === 'white' ? this.isWhiteKey : this.isBlackKey);
			return _.filter(keys, _.bind(filterBy, this));
		},

		// Returns the total number of white keys.
		getNumWhiteKeys: function(keys) {
			return this.filterKeys(keys, 'white').length;
		},

		// Returns the total number of black keys.
		getNumBlackKeys: function(keys) {
			return this.filterKeys(keys, 'black').length;
		},

		// Renders the keyboard.
		render: function() { 
			this._render();
			return this;
		},

		// Returns an object that knows how to render a white or black key.
		_keyRenderer: function(key, numWhiteKeys, keyboardWidth, keyboardHeight) {
			var config = { 
				key: key,
				numWhiteKeys: numWhiteKeys,
				keyboardWidth: keyboardWidth,
				keyboardHeight: keyboardHeight
			};
			return KeyRenderer.create(this.isWhiteKey(key), config);
		},

		// Helper function for rendering.
		_render: function() {
			var paper = this.paper;
			var keys = this.getKeys();
			var numWhiteKeys = this.getNumWhiteKeys(keys);
			var keyboardWidth = this.width();
			var keyboardHeight = this.height();

			// render keyboard
			var keyboardEl = paper.rect(0, 0, keyboardWidth, keyboardHeight);
			keyboardEl.attr('stroke-width', 2);

			// render individual white and black keys
			var whiteKeyIndex = 0;
			var keySet = paper.set();
			var keyRenderers = _.map(keys, function(key) {
				return this._keyRenderer(key, numWhiteKeys, keyboardWidth, keyboardHeight);
			}, this); 

			_.each(keyRenderers, function(keyRenderer, index) {
				keyRenderer.render(paper, whiteKeyIndex);
				keySet.push(keyRenderer.el);
				if(keyRenderer.isWhite) {
					whiteKeyIndex++;
				}
			});
			
			keySet.mousedown(function() {
				this.attr('fill', '#739D00');
			});
		}
	});

	return Keyboard;
});
