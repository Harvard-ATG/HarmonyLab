define(['lodash', 'vexflow'], function(_, Vex) {

	// Holds the current key and key signature.
	// Knows how to spell and manipulate the notes for the key signature.
	var KeySignature = function() {
	};

	_.extend(KeySignature.prototype, {
		_defaultKeySpec: 'C',
		_keySpec: '',
		_keySpelling: {
			"Ab":  ["C","Db","D","Eb","Fb","F","Gb","G","Ab","Bbb","Bb","Cb"],
			"Cbm": ["C","Db","D","Eb","Fb","F","Gb","G","Ab","Bbb","Bb","Cb"], 
			"Eb":  ["C","Db","D","Eb","Fb","F","Gb","G","Ab","A","Bb","Cb"],
			"Gbm": ["C","Db","D","Eb","Fb","F","Gb","G","Ab","A","Bb","Cb"],
			"Bb":  ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","Cb"],
			"Dbm": ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","Cb"],
			"F":   ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],
			"Abm": ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],
			"C":   ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
			"Ebm": ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
			"G":   ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
			"Bbm": ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
			"D":   ["C","C#","D","Eb","E","F","F#","G","G#","A","Bb","B"],
			"Fm":  ["C","C#","D","Eb","E","F","F#","G","G#","A","Bb","B"],
			"A":   ["C","C#","D","D#","E","F","F#","G","G#","A","Bb","B"],
			"Cm":  ["C","C#","D","D#","E","F","F#","G","G#","A","Bb","B"], 
			"E":   ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
			"Gm":  ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
			"B":   ["C","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
			"Dm":  ["C","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
			"F#":  ["B#","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
			"Am":  ["B#","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
			"C#":  ["B#","C#","D","D#","E","E#","F#","F##","G#","A","A#","B"],
			"Em":  ["B#","C#","D","D#","E","E#","F#","F##","G#","A","A#","B"],
			"G#":  ["B#","C#","C##","D#","E","E#","F#","F##","G#","A","A#","B"],
			"Bm":  ["B#","C#","C##","D#","E","E#","F#","F##","G#","A","A#","B"],
			"D#":  ["B#","C#","C##","D#","E","E#","F#","F##","G#","G##","A#","B"],
			"F#m": ["B#","C#","C##","D#","E","E#","F#","F##","G#","G##","A#","B"],
			"A#":  ["B#","C#","C##","D#","D##","E#","F#","F##","G#","G##","A#","B"],
			"C#m": ["B#","C#","C##","D#","D##","E#","F#","F##","G#","G##","A#","A##"]
		},
		_accidentalOrder: ['F','C','G','D','A','E','B'],
		setSpec: function(key) {
			if(!Vex.Flow.keySignature.keySpecs[key]) {
				throw new Error("invalid key spec");
			}
			this._keySpec = key;
		},
		getSpec: function() {
			return this._keySpec || this._defaultKeySpec;
		},
		getNoteSpelling: function() {
			return this._keySpelling[this.getSpec()];
		},
		getAccidentals: function() {
			var spec = Vex.Flow.keySignature.keySpecs[this.getSpec()];
			var order = this._accidentalOrder.slice(0); // copy
			if(spec.acc == 'b') {
				order.reverse();
			}

			return _.map(order.slice(0, spec.num), function(note) {
				return note + (spec.acc||'');
			});
		}
	});

	return KeySignature;
});
