// Configuration
// -------------
// 
// Configuration data used by the application for notation, analysis, and ui.

/* global define: false */
define(function() {

"use strict";

var CONFIG = {

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

	// Wheel for rotating keys sharpward or flatward
	// Default order is sharpward.
	keyWheel: [
		"iD_","jF_","iA_","jC_", "iE_","jG_","iB_","jD_",
		"iF#","jA_","iC#","jE_", "iG#","jB_","iEb","jGb",
		"iBb","iF_","jAb","iC_", "jEb","iG_","jBb"
	],

	// Default key and signature to use for notation. This should be
	// automatically selected on the UI.
	defaultKeyAndSignature: "iD_", // D minor

	// For configuring computer keyboard shortcuts.
	keyboardShortcuts: {
		// Application note on/off keyboard shortcuts.
		// Maps a key to an integer that is relative to middle C.
		// Note: unused letters to avoid mishaps: 3, 6, and g.
		"note": {
			"1": -4, // GA
			"q": -3, // A
			"2": -2, // AB
			"w": -1, // B
			"e": 0, // C
			"4": 1, // CD
			"r": 2, // D
			"5": 3, // DE
			"t": 4, // E
			"y": 5, // F
			"7": 6, // FG
			"u": 7, // G
			"a": 16, // E
			"z": 17, // F
			"s": 18, // FG
			"x": 19, // G
			"d": 20, // GA
			"c": 21, // A
			"f": 22, // AB
			"v": 23, // B
			"b": 24, // C
			"h": 25, // CD
			"n": 26, // D
			"j": 27, // DE
			"m": 28 // E
		},
		// Application control shortcuts.
		// Maps a key to function name.
		"control": {
			"ESC":    "toggleMode",
			"RETURN": "clearNotes", // todo
			"'":      "depressSustain", // todo
			";":      "retakeSustain", // todo
			".":      "releaseSustain", // todo
			"k":      "rotateKeyFlatward",
			"l":      "rotateKeySharpward",
			",":      "setKeyToNone",
		},
		// Defines key code -> key name mappings.
		// This is not intended to be comprehensive. These key names
		// should be used in the note and control shortcut mappings.
		"keyCode": {
			"13": "ENTER",
			"27": "ESC",
			"48": "0",
			"49": "1",
			"50": "2",
			"51": "3",
			"52": "4",
			"53": "5",
			"54": "6",
			"55": "7",
			"56": "8",
			"57": "9",
			"65": "a",
			"66": "b",
			"67": "c",
			"68": "d",
			"69": "e",
			"70": "f",
			"71": "g",
			"72": "h",
			"73": "i",
			"74": "j",
			"75": "k",
			"76": "l",
			"77": "m",
			"78": "n",
			"79": "o",
			"80": "p",
			"81": "q",
			"82": "r",
			"83": "s",
			"84": "t",
			"85": "u",
			"86": "v",
			"87": "w",
			"88": "x",
			"89": "y",
			"90": "z",
			"186": ";",
			"188": ",",
			"190": ".",
			"191": "/",
			"222": "'"
		},
	}
}; // end config

return CONFIG;

});
