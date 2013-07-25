define(['lodash', 'vexflow', 'app/config/analysis'], function(_, Vex, ANALYSIS_CONFIG) {

	// The KeySignature object is responsible for knowing the current key and
	// signature as well as how to spell and notate pitches.
	var KeySignature = function(key, signature) {
		this.setKey(key || ANALYSIS_CONFIG.defaultKey);
		this.setSignature(signature || ANALYSIS_CONFIG.defaultSignature);
	};

	_.extend(KeySignature.prototype, {
		setKey: function(key) {
			this.key = key;
		},
		getKey: function() {
			return this.key;
		},
		setSignature: function(signature) {
			if(!/^(?:b|#)*$/.test(signature)) {
				throw new Error("invalid signature");
			}

			var accidental = signature.charAt(0) || '';
			var order = ANALYSIS_CONFIG.accidentalOrder.slice(0); // make a copy
			if(accidental === 'b') {
				order.reverse();
			}

			this.signature = _.map(order.slice(0, signature.length), function(note) {
				return note + accidental;
			});
		},
		getSignature: function() {
			return this.signature;
		},
		getSpelling: function() {
			return ANALYSIS_CONFIG.noteSpelling[this.key];
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
		}
	});

	return KeySignature;
});
