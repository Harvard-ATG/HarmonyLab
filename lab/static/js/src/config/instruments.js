// Instrument Configuration

/* global define: false */
define({
	// defines a list of instrument numbers that are enabled 
	enabled: [0,6,16,25,46,52],

	// defines the available MIDI instruments
	// maps a MIDI instrument number to it's associated information
	instrumentMap: {
		"0": {
			"name": "Acoustic Grand Piano",
			"shortName": "Piano",
			"category": "Piano"
		},
		"1": {
			"name": "Bright Acoustic Piano",
			"category": "Piano"
		},
		"2": {
			"name": "Electric Grand Piano",
			"category": "Piano"
		},
		"3": {
			"name": "Honky-tonk Piano",
			"category": "Piano"
		},
		"4": {
			"name": "Electric Piano 1",
			"category": "Piano"
		},
		"5": {
			"name": "Electric Piano 2",
			"category": "Piano"
		},
		"6": {
			"name": "Harpsichord",
			"shortName": "Harpsichord",
			"category": "Piano"
		},
		"7": {
			"name": "Clavinet",
			"category": "Piano"
		},
		"8": {
			"name": "Celesta",
			"category": "Chromatic Percussion"
		},
		"9": {
			"name": "Glockenspiel",
			"category": "Chromatic Percussion"
		},
		"10": {
			"name": "Music Box",
			"category": "Chromatic Percussion"
		},
		"11": {
			"name": "Vibraphone",
			"category": "Chromatic Percussion"
		},
		"12": {
			"name": "Marimba",
			"category": "Chromatic Percussion"
		},
		"13": {
			"name": "Xylophone",
			"category": "Chromatic Percussion"
		},
		"14": {
			"name": "Tubular Bells",
			"category": "Chromatic Percussion"
		},
		"15": {
			"name": "Dulcimer",
			"category": "Chromatic Percussion"
		},
		"16": {
			"name": "Drawbar Organ",
			"shortName": "Organ",
			"category": "Organ"
		},
		"17": {
			"name": "Percussive Organ",
			"category": "Organ"
		},
		"18": {
			"name": "Rock Organ",
			"category": "Organ"
		},
		"19": {
			"name": "Church Organ",
			"category": "Organ"
		},
		"20": {
			"name": "Reed Organ",
			"category": "Organ"
		},
		"21": {
			"name": "Accordion",
			"category": "Organ"
		},
		"22": {
			"name": "Harmonica",
			"category": "Organ"
		},
		"23": {
			"name": "Tango Accordion",
			"category": "Organ"
		},
		"24": {
			"name": "Acoustic Guitar (nylon)",
			"category": "Guitar"
		},
		"25": {
			"name": "Acoustic Guitar (steel)",
			"shortName": "Guitar",
			"category": "Guitar"
		},
		"26": {
			"name": "Electric Guitar (jazz)",
			"category": "Guitar"
		},
		"27": {
			"name": "Electric Guitar (clean)",
			"category": "Guitar"
		},
		"28": {
			"name": "Electric Guitar (muted)",
			"category": "Guitar"
		},
		"29": {
			"name": "Overdriven Guitar",
			"category": "Guitar"
		},
		"30": {
			"name": "Distortion Guitar",
			"category": "Guitar"
		},
		"31": {
			"name": "Guitar Harmonics",
			"category": "Guitar"
		},
		"32": {
			"name": "Acoustic Bass",
			"category": "Bass"
		},
		"33": {
			"name": "Electric Bass (finger)",
			"category": "Bass"
		},
		"34": {
			"name": "Electric Bass (pick)",
			"category": "Bass"
		},
		"35": {
			"name": "Fretless Bass",
			"category": "Bass"
		},
		"36": {
			"name": "Slap Bass 1",
			"category": "Bass"
		},
		"37": {
			"name": "Slap Bass 2",
			"category": "Bass"
		},
		"38": {
			"name": "Synth Bass 1",
			"category": "Bass"
		},
		"39": {
			"name": "Synth Bass 2",
			"category": "Bass"
		},
		"40": {
			"name": "Violin",
			"category": "Strings"
		},
		"41": {
			"name": "Viola",
			"category": "Strings"
		},
		"42": {
			"name": "Cello",
			"category": "Strings"
		},
		"43": {
			"name": "Contrabass",
			"category": "Strings"
		},
		"44": {
			"name": "Tremolo Strings",
			"category": "Strings"
		},
		"45": {
			"name": "Pizzicato Strings",
			"category": "Strings"
		},
		"46": {
			"name": "Orchestral Harp",
			"shortname": "Harp",
			"category": "Strings"
		},
		"47": {
			"name": "Timpani",
			"category": "Strings"
		},
		"48": {
			"name": "String Ensemble 1",
			"category": "Ensemble"
		},
		"49": {
			"name": "String Ensemble 2",
			"category": "Ensemble"
		},
		"50": {
			"name": "Synth Strings 1",
			"category": "Ensemble"
		},
		"51": {
			"name": "Synth Strings 2",
			"category": "Ensemble"
		},
		"52": {
			"name": "Choir Aahs",
			"shortName": "Choir",
			"category": "Ensemble"
		},
		"53": {
			"name": "Voice Oohs",
			"category": "Ensemble"
		},
		"54": {
			"name": "Synth Choir",
			"category": "Ensemble"
		},
		"55": {
			"name": "Orchestra Hit",
			"category": "Ensemble"
		},
		"56": {
			"name": "Trumpet",
			"category": "Brass"
		},
		"57": {
			"name": "Trombone",
			"category": "Brass"
		},
		"58": {
			"name": "Tuba",
			"category": "Brass"
		},
		"59": {
			"name": "Muted Trumpet",
			"category": "Brass"
		},
		"60": {
			"name": "French Horn",
			"category": "Brass"
		},
		"61": {
			"name": "Brass Section",
			"category": "Brass"
		},
		"62": {
			"name": "Synth Brass 1",
			"category": "Brass"
		},
		"63": {
			"name": "Synth Brass 2",
			"category": "Brass"
		},
		"64": {
			"name": "Soprano Sax",
			"category": "Reed"
		},
		"65": {
			"name": "Alto Sax",
			"category": "Reed"
		},
		"66": {
			"name": "Tenor Sax",
			"category": "Reed"
		},
		"67": {
			"name": "Baritone Sax",
			"category": "Reed"
		},
		"68": {
			"name": "Oboe",
			"category": "Reed"
		},
		"69": {
			"name": "English Horn",
			"category": "Reed"
		},
		"70": {
			"name": "Bassoon",
			"category": "Reed"
		},
		"71": {
			"name": "Clarinet",
			"category": "Reed"
		},
		"72": {
			"name": "Piccolo",
			"category": "Pipe"
		},
		"73": {
			"name": "Flute",
			"category": "Pipe"
		},
		"74": {
			"name": "Recorder",
			"category": "Pipe"
		},
		"75": {
			"name": "Pan Flute",
			"category": "Pipe"
		},
		"76": {
			"name": "Blown Bottle",
			"category": "Pipe"
		},
		"77": {
			"name": "Shakuhachi",
			"category": "Pipe"
		},
		"78": {
			"name": "Whistle",
			"category": "Pipe"
		},
		"79": {
			"name": "Ocarina",
			"category": "Pipe"
		},
		"80": {
			"name": "Lead 1 (square)",
			"category": "Synth Lead"
		},
		"81": {
			"name": "Lead 2 (sawtooth)",
			"category": "Synth Lead"
		},
		"82": {
			"name": "Lead 3 (calliope)",
			"category": "Synth Lead"
		},
		"83": {
			"name": "Lead 4 (chiff)",
			"category": "Synth Lead"
		},
		"84": {
			"name": "Lead 5 (charang)",
			"category": "Synth Lead"
		},
		"85": {
			"name": "Lead 6 (voice)",
			"category": "Synth Lead"
		},
		"86": {
			"name": "Lead 7 (fifths)",
			"category": "Synth Lead"
		},
		"87": {
			"name": "Lead 8 (bass + lead)",
			"category": "Synth Lead"
		},
		"88": {
			"name": "Pad 1 (new age)",
			"category": "Synth Pad"
		},
		"89": {
			"name": "Pad 2 (warm)",
			"category": "Synth Pad"
		},
		"90": {
			"name": "Pad 3 (polysynth)",
			"category": "Synth Pad"
		},
		"91": {
			"name": "Pad 4 (choir)",
			"category": "Synth Pad"
		},
		"92": {
			"name": "Pad 5 (bowed)",
			"category": "Synth Pad"
		},
		"93": {
			"name": "Pad 6 (metallic)",
			"category": "Synth Pad"
		},
		"94": {
			"name": "Pad 7 (halo)",
			"category": "Synth Pad"
		},
		"95": {
			"name": "Pad 8 (sweep)",
			"category": "Synth Pad"
		},
		"96": {
			"name": "FX 1 (rain)",
			"category": "Synth Effects"
		},
		"97": {
			"name": "FX 2 (soundtrack)",
			"category": "Synth Effects"
		},
		"98": {
			"name": "FX 3 (crystal)",
			"category": "Synth Effects"
		},
		"99": {
			"name": "FX 4 (atmosphere)",
			"category": "Synth Effects"
		},
		"100": {
			"name": "FX 5 (brightness)",
			"category": "Synth Effects"
		},
		"101": {
			"name": "FX 6 (goblins)",
			"category": "Synth Effects"
		},
		"102": {
			"name": "FX 7 (echoes)",
			"category": "Synth Effects"
		},
		"103": {
			"name": "FX 8 (sci-fi)",
			"category": "Synth Effects"
		},
		"104": {
			"name": "Sitar",
			"category": "Ethnic"
		},
		"105": {
			"name": "Banjo",
			"category": "Ethnic"
		},
		"106": {
			"name": "Shamisen",
			"category": "Ethnic"
		},
		"107": {
			"name": "Koto",
			"category": "Ethnic"
		},
		"108": {
			"name": "Kalimba",
			"category": "Ethnic"
		},
		"109": {
			"name": "Bagpipe",
			"category": "Ethnic"
		},
		"110": {
			"name": "Fiddle",
			"category": "Ethnic"
		},
		"111": {
			"name": "Shanai",
			"category": "Ethnic"
		},
		"112": {
			"name": "Tinkle Bell",
			"category": "Percussive"
		},
		"113": {
			"name": "Agogo",
			"category": "Percussive"
		},
		"114": {
			"name": "Steel Drums",
			"category": "Percussive"
		},
		"115": {
			"name": "Woodblock",
			"category": "Percussive"
		},
		"116": {
			"name": "Taiko Drum",
			"category": "Percussive"
		},
		"117": {
			"name": "Melodic Tom",
			"category": "Percussive"
		},
		"118": {
			"name": "Synth Drum",
			"category": "Percussive"
		},
		"119": {
			"name": "Reverse Cymbal",
			"category": "Sound effects"
		},
		"120": {
			"name": "Guitar Fret Noise",
			"category": "Sound effects"
		},
		"121": {
			"name": "Breath Noise",
			"category": "Sound effects"
		},
		"122": {
			"name": "Seashore",
			"category": "Sound effects"
		},
		"123": {
			"name": "Bird Tweet",
			"category": "Sound effects"
		},
		"124": {
			"name": "Telephone Ring",
			"category": "Sound effects"
		},
		"125": {
			"name": "Helicopter",
			"category": "Sound effects"
		},
		"126": {
			"name": "Applause",
			"category": "Sound effects"
		},
		"127": {
			"name": "Gunshot",
			"category": "Sound effects"
		}
	}
});
