// General configuration data
//
// Read-only.

/* global define: false */
define({

	// Defines the default spelling of the twelve pitches based on D-minor.
	noteNames: ['C','C#','D','Eb','E','F','F#','G','G#','A','Bb','B'],

	// Maps the twleve pitch classes [0-11] onto [0-9,y,z]. We are substituting
	// y and z for 10 and 11 so that we can represent each pitch class with a
	// single character. 
	pitchClasses: ["0","1","2","3","4","5","6","7","8","9","y","z"],

	// Defines the order of sharps.
	orderOfSharps: ["F","C","G","D","A","E","B"],

	// Maps each major/minor key to a default spelling of the twelve pitches
	// along with related key information. The keys are identified by unique 
	// three character strings with the following format:
	//
	//		key identifier = [i|j] + [A-G] + [_|#|b] 
	//
	//		[i|j] = minor key, major key
	//		[A-G] = note from A to G
	//		[_|#|b] = natural, sharp, flat
	//
	keyMap: {
		// SPECIAL CASE: this is a special case for "no key" (i.e. NULL value for the key)
		"h": {
			spelling: ["C","C#","D","D#","E","F","F#","G","G#","A","Bb","B"], 
			pitchClass: 0,
			name: "No key",
			shortName: "",
			signature: ""
		},
		"iAb": {
			spelling: ["C","Db","D","Eb","Fb","F","Gb","G","Ab","Bbb","Bb","Cb"],
			pitchClass: 8,
			name: "A♭ minor",
			shortName: "a♭",
			signature: "bbbbbbb",
		},
		"jCb": {
			spelling: ["C","Db","D","Eb","Fb","F","Gb","G","Ab","Bbb","Bb","Cb"], 
			pitchClass: 11,
			name: "C♭ major",
			shortName: "C♭",
			signature: "bbbbbbb",
		},
		"iEb": {
			spelling: ["C","Db","D","Eb","Fb","F","Gb","G","Ab","A","Bb","Cb"],
			pitchClass: 3,
			name: "E♭ minor",
			shortName: "e♭",
			signature: "bbbbbb",
		},
		"jGb": {
			spelling: ["C","Db","D","Eb","Fb","F","Gb","G","Ab","A","Bb","Cb"],
			pitchClass: 6,
			name: "G♭ major",
			shortName: "G♭",
			signature: "bbbbbb",
		},
		"iBb": {
			spelling: ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","Cb"],
			pitchClass: 10,
			name: "B♭ minor",
			shortName: "b♭",
			signature: "bbbbb",
		},
		"jDb": {
			spelling: ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","Cb"],
			pitchClass: 1,
			name: "D♭ major",
			shortName: "D♭",
			signature: "bbbbb", 
		},
		"iF_":  {
			spelling: ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],
			pitchClass: 5,
			name: "F minor",
			shortName: "f",
			signature: "bbbb",
		},
		"jAb": {
			spelling: ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],
			pitchClass: 8,
			name: "A♭ major",
			shortName: "A♭",
			signature: "bbbb",
		},
		"iC_": {
			spelling: ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
			pitchClass: 0,
			name: "C minor",
			shortName: "c",
			signature: "bbb",
		},
		"jEb": {
			spelling: ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
			pitchClass: 3,
			name: "E♭ major",
			shortName: "E♭",
			signature: "bbb",
		},
		"iG_":  {
			spelling: ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
			pitchClass: 7,
			name: "G minor",
			shortName: "g",
			signature: "bb",
		},
		"jBb": {
			spelling: ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
			pitchClass: 10,
			name: "B♭ major",
			shortName: "B♭",
			signature: "bb",
		},
		"iD_":  {
			spelling: ["C","C#","D","Eb","E","F","F#","G","G#","A","Bb","B"],
			pitchClass: 2,
			name: "D minor",
			shortName: "d",
			signature: "b",
		},
		"jF_":  {
			spelling: ["C","C#","D","Eb","E","F","F#","G","G#","A","Bb","B"],
			pitchClass: 5,
			name: "F major",
			shortName: "F",
			signature: "b",
		},
		"iA_":  {
			spelling: ["C","C#","D","D#","E","F","F#","G","G#","A","Bb","B"],
			pitchClass: 9,
			name: "A minor",
			shortName: "a",
			signature: "",
		},
		"jC_":  {
			spelling: ["C","C#","D","D#","E","F","F#","G","G#","A","Bb","B"], 
			pitchClass: 0,
			name: "C major",
			shortName: "C",
			signature: "",
		},
		"iE_":  {
			spelling: ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
			pitchClass: 4,
			name: "E minor",
			shortName: "e",
			signature: "#",
		},
		"jG_": {
			spelling: ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
			pitchClass: 7,
			name: "G major",
			shortName: "G",
			signature: "#",
		},
		"iB_": {
			spelling: ["C","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
			pitchClass: 11,
			name: "B minor",
			shortName: "b",
			signature: "##",
		},
		"jD_": {
			spelling: ["C","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
			pitchClass: 2,
			name: "D major",
			shortName: "D",
			signature: "##",
		},
		"iF#": {
			spelling: ["B#","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
			pitchClass: 6,
			name: "F♯ minor",
			shortName: "f♯",
			signature: "###",
		},
		"jA_": {
			spelling: ["B#","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
			pitchClass: 9,
			name: "A major",
			shortName: "A",
			signature: "###",
		},
		"iC#": {
			spelling: ["B#","C#","D","D#","E","E#","F#","F##","G#","A","A#","B"],
			pitchClass: 1,
			name: "C♯ minor",
			shortName: "c♯",
			signature: "####",
		},
		"jE_": {
			spelling: ["B#","C#","D","D#","E","E#","F#","F##","G#","A","A#","B"],
			pitchClass: 4,
			name: "E major",
			shortName: "E",
			signature: "####",
		},
		"iG#": {
			spelling: ["B#","C#","C##","D#","E","E#","F#","F##","G#","A","A#","B"],
			pitchClass: 8,
			name: "G♯ minor",
			shortName: "g♯",
			signature: "#####",
		},
		"jB_":  {
			spelling: ["B#","C#","C##","D#","E","E#","F#","F##","G#","A","A#","B"],
			pitchClass: 11,
			name: "B major",
			shortName: "B",
			signature: "#####",
		},
		"iD#": {
			spelling: ["B#","C#","C##","D#","E","E#","F#","F##","G#","G##","A#","B"],
			pitchClass: 3,
			name: "D♯ minor",
			shortName: "d♯",
			signature: "######",
		},
		"jF#": {
			spelling: ["B#","C#","C##","D#","E","E#","F#","F##","G#","G##","A#","B"],
			pitchClass: 6,
			name: "F♯ major",
			shortName: "F♯",
			signature: "######",
		},
		"iA#": {
			spelling: ["B#","C#","C##","D#","D##","E#","F#","F##","G#","G##","A#","B"],
			pitchClass: 10,
			name: "A♯ minor",
			shortName: "a♯",
			signature: "#######",
		},
		"jC#": {
			spelling: ["B#","C#","C##","D#","D##","E#","F#","F##","G#","G##","A#","A##"],
			pitchClass: 1,
			name: "C♯ major",
			shortName: "C♯",
			signature: "#######",
		}
	},

	// Maps each of the 15 key signatures to an associated key.
	//
	// This mapping is arbitrary because a key signature could be major or
	// minor. Normally, we expect the user to select a specific key on the UI
	// and the key signature will then be updated to match due to the
	// key-to-key-signature lock. 
	//
	// However, if the user chooses a key signature instead of (as we expect) a
	// key, and the key-to-key-signature lock is enabled, the app needs to know
	// what key should be selected in response, and this mapping provides that.
	//
	keySignatureMap: {
		"bbbbbbb": "jCb",
		"bbbbbb": "jGb",	
		"bbbbb": "jDb",
		"bbbb": "jAb",
		"bbb": "jEb",
		"bb": "jBb",
		"b": "jF_",
		"": "jC_",
		"#": "jG_",
		"##": "jD_",
		"###": "jA_",
		"####": "jE_",
		"#####": "jB_",
		"######": "jF#",
		"#######": "jC#"
	},

	// Grouping of keys as they are to be displayed on the UI.
	keyDisplayGroups: [
		// [label, key1, key2, key3, ..., keyN]
		/*["basic", "h","jC_","iA_","jG_","jF_","iD_"],*/
		/*["sharps", "iE_","jD_","iB_","jA_","iF#","jE_","iC#","jB_","iG#","jF#","iD#","jC#","iA#"],*/
		/*["flats", "jBb","iG_","jEb","iC_","jAb","iF_","jDb","iBb","jGb","iEb","jCb","iAb"]*/
		["basic", "h", "jC_", "iA_"],
		["major", "jCb", "jGb", "jDb", "jAb", "jEb", "jBb", "jF_", "jC_", "jG_", "jD_", "jA_", "jE_", "jB_", "jF#", "jC#"],
		["minor", "iAb", "iEb", "iBb", "iF_", "iC_", "iG_", "iD_", "iA_", "iE_", "iB_", "iF#", "iC#", "iG#", "iD#", "iA#"] 
	],

	// Wheel for rotating keys sharpward or flatward
	// Default order is sharpward.
	keyWheel: [
		"jC_", "iE_","jG_","iB_","jD_","iF#","jA_","iC#",
		"jE_", "iG#","jB_","iEb","jGb","iBb","jDb","iF_",
		"jAb", "iC_","jEb","iG_","jBb","iD_","jF_","iA_"
	],

	// Default key and signature to use for notation. This should be
	// automatically selected on the UI.
	defaultKeyAndSignature: "h", // no key

	// Defines settings for the chord bank.
	chordBank: {
		// This defines the number of chords that can be displayed
		// on the sheet music at one time. It should be a positive
		// integer in the range of 1-10. Chords are displayed
		// in fixed-width areas spread across the sheet music.
		displaySize: 9
	},

	// Defines the default analysis settings 
	analysisSettings: {
		// Enables or disables analysis
		enabled: true,
		// Enables or disables specific analysis modes
		mode: {
			note_names: false, // mutually exclusive with scientific_pitch
			scientific_pitch: false, 
			scale_degrees: true, // mutually exclusive with solfege
			solfege: false, 
			roman_numerals: true,
			intervals: true
		}
	},

	// Defines the default highlight settings
	highlightSettings: {
		// Enables or disables highlighting
		enabled: true,
		// Enables or disables specific highlight modes
		mode: {
			roothighlight: true,
			tritonehighlight: false
			//doublinghighlight: false,
			//octaveshighlight: false
		}
	},

	// Defines default metronome settings.
	metronomeSettings: {
		defaultTempo: 40,
		maxTempo: 360
	},

	// This defines whether keyboard shortcuts are enabled/disabled by default.
	// When true, keyboard shortcuts are enabled by default, otherwise when set
	// to false, they are disabled by default. 
	keyboardShortcutsEnabled: true,

	// Defines when a bank happens in relation to a metronome "tick."
	// Expressed as a fraction of the current metronome tempo.
	bankAfterMetronomeTick: 0.25,

	// Defines the default keyboard size to use on the interface.
	defaultKeyboardSize: 49
});

