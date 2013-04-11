define(['jquery', 'lodash', 'raphael'], function($, _, Raphael) {

    // Keyboard constructor function.
    // 
    // Usage: 
    //
    //  var keyboard = new Keyboard(88);
    //  keyboard.render();
    //  $('#piano').append(keyboard.el);
    //
	var Keyboard = function(numKeys) {
		if(typeof numKeys !== 'undefined') {
			if(!this.keyboardSizes.hasOwnProperty(this.numKeys)) {
				throw new Error("Invalid keyboard size");
			}
			this.numKeys = numKeys;
		}

        this.el = $('<div class="keyboard"></div>');

        this.paper = Raphael(this.el.get(0), this.width, this.height);
	};

	_.extend(Keyboard.prototype, {
        // Dimensions of the keyboard.
        width: 800,
        height: 150,

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

        // Returns the next white key note in the musical alphabet. 
        nextWhiteKey: function(whiteKey) {
            var nextIndex = this.whiteKeys.indexOf(whiteKey) + 1;
            if(nextIndex === -1) {
                throw new Error("Invalid whiteKey. No such white key.");
            }
            return this.whiteKeys.charAt(nextIndex % this.whiteKeys.length);
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

        // Filters a list of keys by white/black.
        filterKeys: function(keys, type) {
            var blackKey = this.blackKey;
            var filterBy;
            if(type === 'white') {
                filterBy = function(key) { return key !== blackKey; };
            } else if(type === 'black') {
                filterBy = function(key) { return key === blackkey; };
            } else {
                throw new Error("Invalid key type");
            }

            return _.filter(keys, filterBy);
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

        // Helper function for rendering.
		_render: function() {
            var paper = this.paper;
			var width = this.width;
			var height = this.height;
			var keys = this.getKeys();
            var numWhiteKeys = this.getNumWhiteKeys(keys);
			var keyboardEl = paper.rect(0, 0, width, height);

			var eachKeys = function(keys, callback) {
				var key, whiteKeyIndex = 0;
				for(var i = 0, len = keys.length; i < len; i++) {
					key = keys[i];
					callback(key, i, whiteKeyIndex); 
					if(key !== '-') {
						whiteKeyIndex++;
					}
				}
			};

			var renderKey = function(key, keyIndex, whiteKeyIndex) {
				var keyWidth = (width / numWhiteKeys);
				var keyOffset = (keyWidth * whiteKeyIndex);
				var keyHeight = height; 
				if(key === '-') {
					keyWidth = (keyWidth / 2);
					keyOffset -= (keyWidth * .5);
					keyHeight *= .75;
				} 

				var el = paper.rect(keyOffset, 0, keyWidth, keyHeight);

				if(key === '-') {
					el.attr('fill', '#000');
				} else {
					paper.text((keyOffset + (keyWidth/2)), keyHeight - 25, key);
					el.attr('stroke', '#000');
				}
			};

			eachKeys(keys, renderKey);
		}
	});

	return Keyboard;
});
