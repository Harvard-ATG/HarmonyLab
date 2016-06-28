define({
	// Application note on/off keyboard shortcuts.

	// Maps a key to an integer relative to the C *one octave below* 
	// middle C (MIDI note number 48).
	//
	// To find the MIDI note number that will be output when a key is pressed,
	// add the relative offset from the note mapping section to this note anchor.
	"noteAnchor": 48,
	
	// Uused letters to avoid mishaps: 3, 6, and g.
	"keyMap": {
		"1":      {msg:"toggleNote", data:-4}, // GA
		"q":      {msg:"toggleNote", data:-3}, // A
		"2":      {msg:"toggleNote", data:-2}, // AB
		"w":      {msg:"toggleNote", data:-1}, // B
		"e":      {msg:"toggleNote", data:0}, // C
		"4":      {msg:"toggleNote", data:1}, // CD
		"r":      {msg:"toggleNote", data:2}, // D
		"5":      {msg:"toggleNote", data:3}, // DE
		"t":      {msg:"toggleNote", data:4}, // E
		"y":      {msg:"toggleNote", data:5}, // F
		"7":      {msg:"toggleNote", data:6}, // FG
		"u":      {msg:"toggleNote", data:7}, // G
		"a":      {msg:"toggleNote", data:16}, // E
		"z":      {msg:"toggleNote", data:17}, // F
		"s":      {msg:"toggleNote", data:18}, // FG
		"x":      {msg:"toggleNote", data:19}, // G
		"d":      {msg:"toggleNote", data:20}, // GA
		"c":      {msg:"toggleNote", data:21}, // A
		"f":      {msg:"toggleNote", data:22}, // AB
		"v":      {msg:"toggleNote", data:23}, // B
		"b":      {msg:"toggleNote", data:24}, // C
		"h":      {msg:"toggleNote", data:25}, // CD
		"n":      {msg:"toggleNote", data:26}, // D
		"j":      {msg:"toggleNote", data:27}, // DE
		"m":      {msg:"toggleNote", data:28}, // E
		"'":      {msg:"depressSustain"},
		";":      {msg:"retakeSustain"}, // not working?
		"\\":     {msg:"retakeSustain"},
		".":      {msg:"releaseSustain"},
		"k":      {msg:"rotateKeyFlatward"},
		"l":      {msg:"rotateKeySharpward"},
		",":      {msg:"setKeyToC"},
		"o":      {msg:"setKeyToNone"},  
		"/":      {msg:"toggleMetronome"},
		"ESC":    {msg:"toggleMode"},
		"ENTER":  {msg:"clearNotes"},
		"SPACE":  {msg:"bankChord"},
		"DOWN":   {msg:"bankChord"},
		"[":      {msg:"toggleHighlights"}, // not created yet
		"]":      {msg:"toggleAnalysis"}, // not created yet
		"RIGHT":  {msg:"openNextExercise"} // not created yet 
	},

	// Defines javascript key code -> key name mappings.
	// This is not intended to be comprehensive. These key names
	// should be used in the note and control shortcut mappings.
	"keyCode": {
		"13": "ENTER",
		"27": "ESC",
		"32": "SPACE",
		"37": "LEFT",
		"38": "UP",
		"39": "RIGHT",
		"40": "DOWN",
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
		"192": "GRAVE",
		"219": "[",
		"220": "\\",
		"221": "]",
		"222": "'"
	}
});
