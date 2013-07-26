define(['lodash', 'vexflow', 'app/config/analysis'], function(_, Vex, ANALYSIS_CONFIG) {

	var DEFAULT_KEY = ANALYSIS_CONFIG.defaultKey;
	var DEFAULT_SIGNATURE = ANALYSIS_CONFIG.defaultSignature;
	var ORDER_OF_ACCIDENTALS = ANALYSIS_CONFIG.orderOfAccidentals;
	var NOTE_SPELLING = ANALYSIS_CONFIG.noteSpelling;

	// The KeySignature object is responsible for knowing the current key and
	// signature as well as how to spell and notate pitches.
	var KeySignature = function(key, signature) {
		this.setKey(key, DEFAULT_KEY);
		this.setSignature(signature, DEFAULT_SIGNATURE);
	};

	_.extend(KeySignature.prototype, {
		setKey: function(key, _default) {
			key = key || _default;
			this.key = key;
		},
		getKey: function() {
			return this.key;
		},
		setSignature: function(signature, _default) {
			signature = signature || _default;
			if(!/^(?:b|#)*$/.test(signature)) {
				throw new Error("invalid signature");
			}

			var accidental = signature.charAt(0) || '';
			var order = ORDER_OF_ACCIDENTALS;
			if(accidental === 'b') {
				order = order.slice(0).reverse(); // slice to copy because reverse() is destructive
			}

			this.signature = _.map(order.slice(0, signature.length), function(note) {
				return note + accidental;
			});
		},
		getSignature: function() {
			return this.signature;
		},
		// This function translates our system for naming keys, prefixed with i or j, 
		// into the key names used by the Vex.Flow library.
		getVexKeyName: function() {
			var key = this.key;
			var vexKeyName = key.slice(1).replace('_','').toUpperCase();

			// vex key names have "m" appended to signify a minor key
			// rather than prepending "i," like we do
			if(key.charAt(0) === 'i') {
				vexKeyName += 'm'; 
			}

			return vexKeyName;
		},
		spellingOf: function(pitchClass, octave) {
			var name = NOTE_SPELLING[this.key][pitchClass];
			return {
				'name': [name, octave].join('/'),
				'has_accidental': false,
				'accidental': ''
			};
		}
	});

	return KeySignature;
});
