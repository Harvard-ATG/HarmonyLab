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
		"iD_":  ["C","C#","D","Eb","E","F","F#","G","G#","A","Bb","B"],

		"iAb": ["C","Db","D","Eb","Fb","F","Gb","G","Ab","Bbb","Bb","Cb"],
		"jCb": ["C","Db","D","Eb","Fb","F","Gb","G","Ab","Bbb","Bb","Cb"], 
		"iEb": ["C","Db","D","Eb","Fb","F","Gb","G","Ab","A","Bb","Cb"],
		"jGb": ["C","Db","D","Eb","Fb","F","Gb","G","Ab","A","Bb","Cb"],
		"iBb": ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","Cb"],
		"jDb": ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","Cb"],
		"iF_":  ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],
		"jAb": ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],
		"iC_":  ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
		"jEb": ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
		"iG_":  ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
		"jBb": ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"],

		// D minor would fit here in the cycle of fifths.

		"jF_":  ["C","C#","D","Eb","E","F","F#","G","G#","A","Bb","B"],
		"iA_":  ["C","C#","D","D#","E","F","F#","G","G#","A","Bb","B"],
		"jC_":  ["C","C#","D","D#","E","F","F#","G","G#","A","Bb","B"], 
		"iE_":  ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
		"jG_":  ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
		"iB_":  ["C","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
		"jD_":  ["C","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
		"iF#": ["B#","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
		"jA_":  ["B#","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
		"iC#": ["B#","C#","D","D#","E","E#","F#","F##","G#","A","A#","B"],
		"jE_":  ["B#","C#","D","D#","E","E#","F#","F##","G#","A","A#","B"],
		"iG#": ["B#","C#","C##","D#","E","E#","F#","F##","G#","A","A#","B"],
		"jB_":  ["B#","C#","C##","D#","E","E#","F#","F##","G#","A","A#","B"],
		"iD#": ["B#","C#","C##","D#","E","E#","F#","F##","G#","G##","A#","B"],
		"jF#": ["B#","C#","C##","D#","E","E#","F#","F##","G#","G##","A#","B"],
		"iA#": ["B#","C#","C##","D#","D##","E#","F#","F##","G#","G##","A#","B"],
		"jC#": ["B#","C#","C##","D#","D##","E#","F#","F##","G#","G##","A#","A##"]
	},

	// Maps key identifers (3 characters) with their associated key name
	keyNames: {
		"jC_": "C major ",
		"iD_": "D minor ",
		"jF_": "F major ",
		"jG_": "G major ",
		"iA_": "A minor ",
		"jEb": "Eb major",
		"jBb": "Bb major",
		"jD_": "D major",
		"jA_": "A major",
		"iC_": "C minor",
		"iG_": "G minor",
		"iE_": "E minor",
		"iB_": "B minor",
		"iF#": "F# minor",
		"jCb": "Cb major",
		"jGb": "Gb major",
		"jDb": "Db major",
		"jAb": "Ab major",
		"jE_": "E major",
		"jB_": "B major",
		"jF#": "F# major",
		"jC#": "C# major",
		"iAb": "Ab minor",
		"iEb": "Eb minor",
		"iBb": "Bb minor",
		"iF_": "F minor",
		"iC#": "C# minor",
		"iG#": "G# minor",
		"iD#": "D# minor",
		"iA#": "A# minor"
	},

	// The order of accidentals from C-major on the circle of fifths.
	orderOfAccidentals: ['F','C','G','D','A','E','B'],

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
	defaultKey: 'jF_',
	defaultSignature: 'b', // #[1-7]|b[1-7]
});
