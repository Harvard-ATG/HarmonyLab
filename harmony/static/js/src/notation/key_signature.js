define(['lodash', 'microevent', 'app/config/analysis'], function(_, MicroEvent, ANALYSIS_CONFIG) {

	var DEFAULT_KEY = ANALYSIS_CONFIG.defaultKeyAndSignature;
	var KEY_MAP = ANALYSIS_CONFIG.keyMap;
	var KEY_SIGNATURE_MAP = ANALYSIS_CONFIG.keySignatureMap;

	// The KeySignature object is responsible for knowing the current key and
	// signature as well as how to spell and notate pitches.
	var KeySignature = function(key) {
		this.setKey(key || DEFAULT_KEY, true);
	};

	_.extend(KeySignature.prototype, {
		// sets the key and optionally locks or syncs the signature to the key
		setKey: function(key, lock) {
			key = key;
			if(!KEY_MAP.hasOwnProperty(key)) {
				throw new Error("invalid key");
			}

			this.key = key;

			if(lock) {
				this.setSignature(KEY_MAP[this.key].signature);
			}

			this.trigger('change');
		},
		// returns the current key value
		getKey: function() {
			return this.key;
		},
		// returns the name of the current key
		getKeyName: function() {
			return KEY_MAP[this.key].name;
		},
		// returns the spelling for the current key
		getNoteSpelling: function() {
			return KEY_MAP[this.key].spelling;
		},
		// returns true if the signature is valid, false otherwise
		isSignatureSpec: function(spec) {
			return /^(?:b|#){0,7}$/.test(spec); // should be a string of sharp or flat symbols
		},
		// set the signature
		setSignature: function(accidentals, lock) {
			var accidental, accidental_order = ["F","C","G","D","A","E","B"]; 
	
			if(!this.isSignatureSpec(accidentals)) {
				throw new Error("invalid signature");
			}

			// reverse the order of accidentals to notate flats
			accidental = accidentals.charAt(0) || '';
			if(accidental === 'b') {
				accidental_order = accidental_order.reverse();
			}

			// save signature as list of notes with accidentals
			this.signature = _.map(accidental_order.slice(0, accidentals.length), function(note) {
				return note + accidental;
			});

			// optionally update the key value implied by the signature
			if(lock) {
				this.setKey(KEY_SIGNATURE_MAP[accidentals]);
			}

			this.trigger('change');
		},
		// returns the current signature
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
		// returns the spelling of a note identified by its pitch class and octave
		spellingOf: function(pitchClass, octave) {
			var spelling = this.getNoteSpelling();
			var note = spelling[pitchClass];
			var accidental = this.calculateAccidental(note);

			octave = this.calculateOctave(pitchClass, octave, note);

			var spelling = {
				key_name: [note, octave].join('/'),
				accidental: accidental,
				has_accidental: (accidental !== '')
			};

			return spelling;
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
