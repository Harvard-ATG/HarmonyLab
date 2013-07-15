define(['lodash', 'vexflow'], function(_, Vex) {

	var accidentalOrder = ['F','C','G','D','A','E','B'];

	var spelling = {
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
	};

	return {
		getNotesForKey: function(key) {
			var notes = spelling[key];
			return notes;
		},
		getAccidentals: function(key) {
			var spec = Vex.Flow.keySignature.keySpecs[key];
			var order = accidentalOrder.slice(0); // copy
			if(spec.acc == 'b') {
				order.reverse();
			}

			return _.map(order.slice(0, spec.num), function(note) {
				return note + (spec.acc||'');
			});
		}
	};
});
