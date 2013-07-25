// Analysis Configuration
// ----------------------
//
// Define analysis-specific information here.
// 

define({
	// The default notation or spelling of the twelve pitches in the 
	// chromatic scale is based on D-minor. 
	noteNames: ['C','C#','D','Eb','E','F','F#','G','G#','A','Bb','B'],

	// The spelling filters for raw MIDI information.
	// Maps a major/minor key to a default spelling of the twelve pitches.
	noteSpelling: {
		"iD":  ["C","C#","D","Eb","E","F","F#","G","G#","A","Bb","B"],

		"iAb": ["C","Db","D","Eb","Fb","F","Gb","G","Ab","Bbb","Bb","Cb"],
		"jCb": ["C","Db","D","Eb","Fb","F","Gb","G","Ab","Bbb","Bb","Cb"], 
		"iEb": ["C","Db","D","Eb","Fb","F","Gb","G","Ab","A","Bb","Cb"],
		"jGb": ["C","Db","D","Eb","Fb","F","Gb","G","Ab","A","Bb","Cb"],
		"iBb": ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","Cb"],
		"jDb": ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","Cb"],
		"iF":  ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],
		"jAb": ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],
		"iC":  ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
		"jEb": ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
		"iG":  ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
		"jBb": ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"],

		// D minor would fit here in the cycle of fifths.

		"jF":  ["C","C#","D","Eb","E","F","F#","G","G#","A","Bb","B"],
		"iA":  ["C","C#","D","D#","E","F","F#","G","G#","A","Bb","B"],
		"jC":  ["C","C#","D","D#","E","F","F#","G","G#","A","Bb","B"], 
		"iE":  ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
		"jG":  ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
		"iB":  ["C","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
		"jD":  ["C","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
		"iF#": ["B#","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
		"jA":  ["B#","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
		"iC#": ["B#","C#","D","D#","E","E#","F#","F##","G#","A","A#","B"],
		"jE":  ["B#","C#","D","D#","E","E#","F#","F##","G#","A","A#","B"],
		"iG#": ["B#","C#","C##","D#","E","E#","F#","F##","G#","A","A#","B"],
		"jB":  ["B#","C#","C##","D#","E","E#","F#","F##","G#","A","A#","B"],
		"iD#": ["B#","C#","C##","D#","E","E#","F#","F##","G#","G##","A#","B"],
		"jF#": ["B#","C#","C##","D#","E","E#","F#","F##","G#","G##","A#","B"],
		"iA#": ["B#","C#","C##","D#","D##","E#","F#","F##","G#","G##","A#","B"],
		"jC#": ["B#","C#","C##","D#","D##","E#","F#","F##","G#","G##","A#","A##"]
	},

	// The order of accidentals from C-major on the circle of fifths.
	accidentalOrder: ['F','C','G','D','A','E','B'],

	// This defines the keynote pitch class for each key. In other words,
	// it maps the key name to an integer [0,11] such that 0=C,1=C#,...,B=11
	// that represents the keynote.
	keynotePitchClass: {
		"none": 0,
		"jC":  0,
		"iC":  0,
		"jC#": 1,
		"iC#": 1,
		"jDb": 1,
		"jD":  2,
		"iDm": 2,
		"iD#": 3,
		"jEb": 3,
		"iEb": 3,
		"jE":  4,
		"iE":  4,
		"jF":  5,
		"iF":  5,
		"jF#": 6,
		"iF#": 6,
		"jGb": 6,
		"jG":  7,
		"iG":  7,
		"iG#": 8,
		"jAb": 8,
		"iAb": 8,
		"jA":  9,
		"iA":  9,
		"iA#": 10,
		"jBb": 10,
		"iBb": 10,
		"jB":  11,
		"iB":  11,
		"jCb": 11
	},

	// Default key and signature for 
	defaultKey: 'jF',
	defaultSignature: 'b',
});
