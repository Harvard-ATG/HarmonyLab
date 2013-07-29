define(['lodash', 'microevent', 'app/config/analysis'], function(_, MicroEvent, ANALYSIS_CONFIG) {

	var DEFAULT_KEY = ANALYSIS_CONFIG.defaultKeyAndSignature;
	var KEY_MAP = ANALYSIS_CONFIG.keyMap;
	var KEY_SIGNATURE_MAP = ANALYSIS_CONFIG.keySignatureMap;

	// The KeySignature object is responsible for knowing the current key and
	// signature as well as how to spell and notate pitches.
	//
	// --Note-- 
	// From the user's point of view, there is only one "key," but in order
	// to notate the pitches with Vex.Flow, we must also maintain a *keyOfSignature*
	// property. The *key* property does not need to match *keyOfSignature*, 
	// although most of the time it will.
	
	var KeySignature = function(key) {
		var k = key || DEFAULT_KEY;
		this.setKey(k);
		this.setKeyOfSignature(k);
		this.setSignature(this.keyToSignature(k));
	};

	_.extend(KeySignature.prototype, {
		// change the key value
		changeKey: function(key, lock) {
			this.setKey(key);
			if(lock) {
				this.setKeyOfSignature(key);
				this.setSignature(this.keyToSignature(key));
			}
			this.trigger('change');
		},
		// change the signature value
		changeSignature: function(keyOfSignature, lock) {
			this.setKeyOfSignature(keyOfSignature);
			this.setSignature(this.keyToSignature(keyOfSignature));
			if(lock) {
				this.setKey(keyOfSignature);
			}
			this.trigger('change');
		},
		// sets the key 
		setKey: function(key) {
			if(!KEY_MAP.hasOwnProperty(key)) {
				throw new Error("invalid key");
			}
			this.key = key;
		},
		// returns the current key value
		getKey: function() {
			return this.key;
		},
		// returns the name of the current key
		getKeyName: function() {
			return this.keyToName(this.key);
		},
		// returns true if the signature is valid, false otherwise
		isSignatureSpec: function(spec) {
			var re = /^(?:b|#){0,7}$/; // string of sharp or flat symbols
			return re.test(spec); 
		},
		// returns list of notes in the correct order to notate 
		// the signature for sharps or flats
		getAccidentalList: function(accidental, num_accidentals) {
			var order = ["F","C","G","D","A","E","B"];
			if(accidental === 'b') {
				order = order.reverse();
			}
			return order.slice(0, num_accidentals);
		},
		// return list of accidentals for the signature spec
		specToSignature: function(signatureSpec) {
			var notes, accidental, num_accidentals;
	
			// ensure valid signature specification
			if(!this.isSignatureSpec(signatureSpec)) {
				throw new Error("invalid signature");
			}

			// reverse the order of accidentals to notate flats (default order for sharps)
			accidental = signatureSpec.charAt(0) || '';
			num_accidentals = signatureSpec.length;
			notes = this.getAccidentalList(accidental, num_accidentals);

			return _.map(notes, function(note) {
				return note + accidental;
			});
		},
		// set the signature
		setSignature: function(signatureSpec) {
			this.signatureSpec = signatureSpec;
			this.signature = this.specToSignature(signatureSpec);
		},
		// returns the signature, or list of accidentals
		getSignature: function() {
			return this.signature;
		},
		// returns the signature specification
		getSignatureSpec: function() {
			return this.signatureSpec;
		},
		setKeyOfSignature: function(key) {
			this.keyOfSignature = key;
		},
		getKeyOfSignature: function() {
			return this.keyOfSignature;
		},
		// returns the signature for a key
		keyToSignature: function(key) {
			return KEY_MAP[key].signature;
		},
		// returns the name for a key
		keyToName: function(key) {
			return KEY_MAP[key].name;
		},
		// returns the spelling based on the current key signature
		keyToSpelling: function(key) {
			return KEY_MAP[key].spelling;
		},
		// This function translates our system for naming keys, prefixed with i or j, 
		// into the key names used by the Vex.Flow library.
		getVexKeyName: function() {
			var key = this.keyOfSignature;
			var vexKeyName = key.slice(1).replace('_','');

			// vex key names have "m" appended to signify a minor key
			// rather than prepending "i," like we do
			if(key.charAt(0) === 'i') {
				vexKeyName += 'm'; 
			}

			return vexKeyName;
		},
		// returns the spelling of a note identified by its pitch class and octave
		spellingOf: function(pitchClass, octave) {
			var note_spelling = this.keyToSpelling(this.keyOfSignature);
			var note = note_spelling[pitchClass];
			var accidental = this.calculateAccidental(note);

			octave = this.calculateOctave(pitchClass, octave, note);

			return {
				key_name: [note, octave].join('/'),
				accidental: accidental,
				has_accidental: (accidental !== '')
			};
		},
		// returns the octave for a note (for edge cases)
		calculateOctave: function(pitchClass, octave, note) {
			var note_letter = note.charAt(0);
			if(pitchClass === 0 && note_letter === 'B') {
				return octave - 1;
			} else if(pitchClass === 11 && note_letter === 'C') {
				return octave + 1;
			}
			return octave;
		},
		// returns the accidental for a note (if any) based upon 
		// the current key signature
		calculateAccidental: function(note) {
			if(this.signatureContains(note)) {
				return '';
			} else if(this.needsNatural(note)) {
				return 'n';
			}
			return note.substr(1);
		},
		// returns true if the note needs a "natural" accidental
		// as a result of the current key signature, false otherwise
		needsNatural: function(note) {
			var i, len, signature = this.signature;
			for(i = 0, len = signature.length; i < len; i++) {
				if(signature[i].charAt(0) === note) {
					return true;
				}
			}
			return false;
		},
		// returns true if the note is contained in the key signature, false
		// otherwise
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

	MicroEvent.mixin(KeySignature);

	return KeySignature;
});
