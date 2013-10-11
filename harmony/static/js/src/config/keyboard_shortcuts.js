define({
	// Application note on/off keyboard shortcuts.
	//
	// Maps a key to an integer relative to the C *one octave below* 
	// middle C (MIDI note number 48).
	//
	// To find the MIDI note number that will be output when a key is pressed,
	// add the relative offset from the note mapping section to this note anchor.
	"noteAnchor": 48,
	
	// Uused letters to avoid mishaps: 3, 6, and g.
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
		"ENTER":  "clearNotes",
		"SPACE":  "bankChord",
		"'":      "depressSustain",
		";":      "retakeSustain",
		".":      "releaseSustain",
		"k":      "rotateKeyFlatward",
		"l":      "rotateKeySharpward",
		",":      "setKeyToNone"
	},
	// Defines key code -> key name mappings.
	// This is not intended to be comprehensive. These key names
	// should be used in the note and control shortcut mappings.
	"keyCode": {
		"13": "ENTER",
		"27": "ESC",
		"32": "SPACE",
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
	}
});
