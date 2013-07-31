// Configuration
// -------------
// 
// Configuration data used by the application for notation, analysis, and ui.

define({

	// Defines the default spelling of the twelve pitches based on D-minor.
	noteNames: ['C','C#','D','Eb','E','F','F#','G','G#','A','Bb','B'],

	// Maps the twleve pitch classes [0-11] onto [0-9,y,z]. We are substituting
	// y and z for 10 and 11 so that we can represent each pitch class with a
	// single character. 
	pitchClasses: ["0","1","2","3","4","5","6","7","8","9","y","z"],

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
		"iAb": {
			spelling: ["C","Db","D","Eb","Fb","F","Gb","G","Ab","Bbb","Bb","Cb"],
			pitchClass: 8,
			name: "A minor",
			shortName: "a",
			signature: "bbbbbbb",
		},
		"jCb": {
			spelling: ["C","Db","D","Eb","Fb","F","Gb","G","Ab","Bbb","Bb","Cb"], 
			pitchClass: 11,
			name: "Cb major",
			shortName: "Cb",
			signature: "bbbbbbb",
		},
		"iEb": {
			spelling: ["C","Db","D","Eb","Fb","F","Gb","G","Ab","A","Bb","Cb"],
			pitchClass: 3,
			name: "Eb major",
			shortName: "Eb",
			signature: "bbbbbb",
		},
		"jGb": {
			spelling: ["C","Db","D","Eb","Fb","F","Gb","G","Ab","A","Bb","Cb"],
			pitchClass: 6,
			name: "Gb major",
			shortName: "Gb",
			signature: "bbbbbb",
		},
		"iBb": {
			spelling: ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","Cb"],
			pitchClass: 10,
			name: "Bb minor",
			shortName: "bb",
			signature: "bbbbb",
		},
		"jDb": {
			spelling: ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","Cb"],
			pitchClass: 1,
			name: "Db major",
			shortName: "Db",
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
			name: "Ab major",
			shortName: "Ab",
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
			name: "Eb major",
			shortName: "Eb",
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
			name: "Bb major",
			shortName: "Bb",
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
			name: "F# minor",
			shortName: "f#",
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
			name: "C# minor",
			shortName: "c#",
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
			name: "G# minor",
			shortName: "g#",
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
			name: "D# minor",
			shortName: "d#",
			signature: "######",
		},
		"jF#": {
			spelling: ["B#","C#","C##","D#","E","E#","F#","F##","G#","G##","A#","B"],
			pitchClass: 6,
			name: "F# major",
			shortName: "F#",
			signature: "######",
		},
		"iA#": {
			spelling: ["B#","C#","C##","D#","D##","E#","F#","F##","G#","G##","A#","B"],
			pitchClass: 10,
			name: "A# minor",
			shortName: "a#",
			signature: "#######",
		},
		"jC#": {
			spelling: ["B#","C#","C##","D#","D##","E#","F#","F##","G#","G##","A#","A##"],
			pitchClass: 1,
			name: "C# major",
			shortName: "C#",
			signature: "#######",
		}
	},

	// Maps each of the 15 key signatures to an associated key.
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
		["----", "jC_","iD_","jF_","jG_","iA_"],
		["----", "jEb","jBb","jF_","jC_","jG_","jD_","jA_"],
		["----", "iC_","iG_","iD_","iA_","iE_","iB_","iF#"],
		["----", "jCb","jGb","jDb","jAb","jE_","jB_","jF#","jC#"],
		["----", "iAb","iEb","iBb","iF_","iC#","iG#","iD#","iA#"]
	],

	// Default key and signature to use for notation. This should be
	// automatically selected on the UI.
	defaultKeyAndSignature: "iD_", // D minor

	// For configuring computer keyboard shortcuts to play MIDI notes
	// and control application behavior.
	keyboardShortcuts: {
		// Maps a keycode to a note (assumes 0 = middle C).
		// Note: unused letters to avoid mishaps: 3[51], 6[54], g[71].
		"notes": {
			49: -4, // 1 = GA
			81: -3, // q = A
			50: -2, // 2 = AB
			87: -1, // w = B
			69: 0, // e = C
			52: 1, // 4 = CD
			82: 2, // r = D
			53: 3, // 5 = DE
			84: 4, // t = E
			89: 5, // y = F
			55: 6, // 7 = FG
			85: 7, // u = G
			65: 16, // a = E
			90: 17, // z = F
			83: 18, // s = FG
			88: 19, // x = G
			68: 20, // d = GA
			67: 21, // c = A
			70: 22, // f = AB
			86: 23, // v = B
			66: 24, // b = C
			72: 25, // h = CD
			78: 26, // n = D
			74: 27, // j = DE
			77: 28 // m = E
		},
		// Maps a keycode to a control function.
		"controls": {
			27:  "toggleShortcutMode", // char = ESC switch for MIDI on QWERTY
			13:  "clearNotes", // char = RETURN
			222: "depressSustain", // char = '
			186: "retakeSustain", // char = ;
			190: "releaseSustain", // char = .
			75:  "rotateKeyFlatward", // char = k
			76:  "rotateKeySharpward", // char = l
			188: "setKeyToNone", // char = ,
		},
	}

});
