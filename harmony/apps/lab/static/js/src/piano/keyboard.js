// Note: also requires "raphael" (issue with requirejs, so loaded manually, not with requirejs)
define(['jquery', 'lodash', 'lab/piano/keyrenderer', 'lab/piano/keygenerator'], function($, _, KeyRenderer, KeyGenerator) {

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

		// Number of keys on the keyboard
		numKeys: 49,

		// Represents a black key note.
		blackKey: '-',

		// Initialize the keyboard object.
		init: function(numKeys) {
			this.el = $('<div class="keyboard"></div>');
			this.paper = Raphael(this.el.get(0), this.width(), this.height());
		},

		// Returns a key sequence for the keyboard.
		getKeys: function() {
			return KeyGenerator.generate(this.numKeys);
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
		_keyRenderer: function(config) {
			return KeyRenderer.create(config);
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
				return this._keyRenderer({
					key: key,
					isWhite: this.isWhiteKey(key),
					numWhiteKeys: numWhiteKeys,
					keyboardWidth: keyboardWidth,
					keyboardHeight: keyboardHeight
				});
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
