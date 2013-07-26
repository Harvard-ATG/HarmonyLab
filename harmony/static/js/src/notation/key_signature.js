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
			var vexKeyName = key.slice(1).replace('_','');

			// vex key names have "m" appended to signify a minor key
			// rather than prepending "i," like we do
			if(key.charAt(0) === 'i') {
				vexKeyName += 'm'; 
			}

			return vexKeyName;
		},
		spellingOf: function(pitchClass, octave) {
			var note = NOTE_SPELLING[this.key][pitchClass];
			var accidental = this.calculateAccidental(note);

			octave = this.calculateOctave(pitchClass, octave, note);

			var spelling = {
				key_name: [note, octave].join('/'),
				accidental: accidental,
				has_accidental: (accidental !== '')
			};

			return spelling;
		},
		calculateOctave: function(pitchClass, octave, note) {
			if(pitchClass === 0 && note.charAt(0) === 'B') {
				return octave - 1;
			}
			return octave;
		},
		calculateAccidental: function(note) {
			if(this.signatureContains(note)) {
				return '';
			} else if(this.needsNatural(note)) {
				return 'n';
			}
			return note.substr(1);
		},
		needsNatural: function(note) {
			var i, len, signature = this.signature;
			for(i = 0, len = signature.length; i < len; i++) {
				if(signature[i].charAt(0) === note) {
					return true;
				}
			}
			return false;
		},
		signatureContains: function(note) {
			var i, len, signature = this.signature;
			for(i = 0, len = signature.length; i < len; i++) {
				if(signature[i] === note) {
					return true;
				}
			}
			return false;
		}
	});

	return KeySignature;
});
