// Analysis Configuration
// ----------------------
//
// Define analysis-specific information here.
// 

define({

	// The default notation or spelling of the twelve pitches in the 
	// chromatic scale is based on D-minor. 
	noteNames: ['C','C#','D','Eb','E','F','F#','G','G#','A','Bb','B'],

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
			signature: "bbbbbbb",
		},
		"jCb": {
			spelling: ["C","Db","D","Eb","Fb","F","Gb","G","Ab","Bbb","Bb","Cb"], 
			pitchClass: 11,
			name: "Cb major",
			signature: "bbbbbbb",
		},
		"iEb": {
			spelling: ["C","Db","D","Eb","Fb","F","Gb","G","Ab","A","Bb","Cb"],
			pitchClass: 3,
			name: "Eb major",
			signature: "bbbbbb",
		},
		"jGb": {
			spelling: ["C","Db","D","Eb","Fb","F","Gb","G","Ab","A","Bb","Cb"],
			pitchClass: 6,
			name: "Gb major",
			signature: "bbbbbb",
		},
		"iBb": {
			spelling: ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","Cb"],
			pitchClass: 10,
			name: "Bb minor",
			signature: "bbbbb",
		},
		"jDb": {
			spelling: ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","Cb"],
			pitchClass: 1,
			name: "Db major",
			signature: "bbbbb", 
		},
		"iF_":  {
			spelling: ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],
			pitchClass: 5,
			name: "F minor",
			signature: "bbbb",
		},
		"jAb": {
			spelling: ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],
			pitchClass: 8,
			name: "Ab major",
			signature: "bbbb",
		},
		"iC_": {
			spelling: ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
			pitchClass: 0,
			name: "C minor",
			signature: "bbb",
		},
		"jEb": {
			spelling: ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
			pitchClass: 3,
			name: "Eb major",
			signature: "bbb",
		},
		"iG_":  {
			spelling: ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
			pitchClass: 7,
			name: "G minor",
			signature: "bb",
		},
		"jBb": {
			spelling: ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
			pitchClass: 10,
			name: "Bb major",
			signature: "bb",
		},
		"iD_":  {
			spelling: ["C","C#","D","Eb","E","F","F#","G","G#","A","Bb","B"],
			pitchClass: 2,
			name: "D minor",
			signature: "b",
		},
		"jF_":  {
			spelling: ["C","C#","D","Eb","E","F","F#","G","G#","A","Bb","B"],
			pitchClass: 5,
			name: "F major",
			signature: "b",
		},
		"iA_":  {
			spelling: ["C","C#","D","D#","E","F","F#","G","G#","A","Bb","B"],
			pitchClass: 9,
			name: "A minor",
			signature: "",
		},
		"jC_":  {
			spelling: ["C","C#","D","D#","E","F","F#","G","G#","A","Bb","B"], 
			pitchClass: 0,
			name: "C major",
			signature: "",
		},
		"iE_":  {
			spelling: ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
			pitchClass: 4,
			name: "E minor",
			signature: "#",
		},
		"jG_": {
			spelling: ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
			pitchClass: 7,
			name: "G major",
			signature: "#",
		},
		"iB_": {
			spelling: ["C","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
			pitchClass: 11,
			name: "B minor",
			signature: "##",
		},
		"jD_": {
			spelling: ["C","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
			pitchClass: 2,
			name: "D major",
			signature: "##",
		},
		"iF#": {
			spelling: ["B#","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
			pitchClass: 6,
			name: "F# minor",
			signature: "###",
		},
		"jA_": {
			spelling: ["B#","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
			pitchClass: 9,
			name: "A major",
			signature: "###",
		},
		"iC#": {
			spelling: ["B#","C#","D","D#","E","E#","F#","F##","G#","A","A#","B"],
			pitchClass: 1,
			name: "C# minor",
			signature: "####",
		},
		"jE_": {
			spelling: ["B#","C#","D","D#","E","E#","F#","F##","G#","A","A#","B"],
			pitchClass: 4,
			name: "E major",
			signature: "####",
		},
		"iG#": {
			spelling: ["B#","C#","C##","D#","E","E#","F#","F##","G#","A","A#","B"],
			pitchClass: 8,
			name: "G# minor",
			signature: "#####",
		},
		"jB_":  {
			spelling: ["B#","C#","C##","D#","E","E#","F#","F##","G#","A","A#","B"],
			pitchClass: 11,
			name: "B major",
			signature: "#####",
		},
		"iD#": {
			spelling: ["B#","C#","C##","D#","E","E#","F#","F##","G#","G##","A#","B"],
			pitchClass: 3,
			name: "D# minor",
			signature: "######",
		},
		"jF#": {
			spelling: ["B#","C#","C##","D#","E","E#","F#","F##","G#","G##","A#","B"],
			pitchClass: 6,
			name: "F# major",
			signature: "######",
		},
		"iA#": {
			spelling: ["B#","C#","C##","D#","D##","E#","F#","F##","G#","G##","A#","B"],
			pitchClass: 10,
			name: "A# minor",
			signature: "#######",
		},
		"jC#": {
			spelling: ["B#","C#","C##","D#","D##","E#","F#","F##","G#","G##","A#","A##"],
			pitchClass: 1,
			name: "C# major",
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
});
