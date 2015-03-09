// Input values and root values should be mod-12 elements (0123456789yz) where 0 = pc of keynote.
// "5/18" means bass is pc 5 and remaining notes in collection are pc 1 and 8.
//
// In the label field, the contents of {} indicate figured bass as follows:
//    main row : r, t, z, u (for 4, 5, 6, 7)
//    below : 2, 3, 4, 5
//    above : Z, U (for 5, 6)
// Whereas {C} and {K} indicate flat and sharp modifiers for the Roman numerals.
//
// The priority field contains an interpretation of learning priorities.
// (1 = learn first, 99 = learn last)

/* global define: false */

define({
   
   // I
   
	"0/47": {"root": "0", "label": "I", "priority": "1"},
	"0/4": {"root": "0", "label": "I{ e}", "nofifth": "true", "priority": "6"},
	"4/07": {"root": "0", "label": "I{ z}", "priority": "4"},
	"7/04": {"root": "7", "label": "I{ z4}", "priority": "70"},
	
	// "0/57": {"root": "0", "label": "I{ t4}", "ifProceedsTo": "0/47", "priority": "70"},
	
	"0/47z": {"root": "0", "label": "I{ u}", "priority": "10"},
	"4/07z": {"root": "0", "label": "I{ z5}", "priority": "90"},
	"7/04z": {"root": "0", "label": "I{ r3}", "priority": "90"},
	"z/047": {"root": "0", "label": "I{ r2}", "priority": "90"},
	
	"0/47y": {"root": "0", "label": "V{ u}/IV", "priority": "80"},
	"0/4y": {"root": "0", "label": "V{ u3}/IV", "nofifth": "true", "priority": "80"},
	"4/07y": {"root": "0", "label": "V{ z5}/IV", "priority": "80"},
	"7/04y": {"root": "0", "label": "V{ r3}/IV", "priority": "80"},
	"y/047": {"root": "0", "label": "V{ r2}/IV", "priority": "80"},

	// viio/ii
	
	"1/47": {"root": "1", "label": "vii&dim/ii", "priority": "90"},
	"4/17": {"root": "1", "label": "vii&dim;{ z}/ii", "priority": "80"},
	"7/47": {"root": "1", "label": "vii&dim;{ z4}/ii", "priority": "90"},

	"1/47y": {"root": "1", "label": "vii&dim;{ u}/ii", "priority": "80"},
   "4/17y": {"root": "1", "label": "vii&dim;{ z5}/ii", "priority": "90"},
 	"7/14y": {"root": "1", "label": "vii&dim;{ r3}/ii", "priority": "90"},
	"y/147": {"root": "1", "label": "vii&dim;{ r2}/ii", "priority": "90"},
	
	// ii
	
	"2/59": {"root": "2", "label": "ii", "priority": "1"},
	"5/29": {"root": "2", "label": "ii{ z}", "priority": "4"},
	"5/29": {"root": "2", "label": "ii{ z4}", "priority": "90"},
	
	"2/059": {"root": "2", "label": "ii{ u}", "priority": "7"},
	"5/029": {"root": "2", "label": "ii{ z5}", "priority": "7"},
	"9/025": {"root": "2", "label": "ii{ r3}", "priority": "60"},
	"0/259": {"root": "2", "label": "ii{ r2}", "priority": "60"},
	
	"2/69": {"root": "2", "label": "V/V", "priority": "80"},
	"6/29": {"root": "2", "label": "V{ z}/V", "priority": "80"},
	"9/26": {"root": "2", "label": "V{ z4}/V", "priority": "80"},
		
	"2/069": {"root": "2", "label": "V{ u}/V", "priority": "80"},
	"2/06": {"root": "2", "label": "V{ u3}/V;", "nofifth": "true", "priority": "80"},
	"6/029": {"root": "2", "label": "V{ z5}/V", "priority": "80"},
	"9/026": {"root": "2", "label": "V{ r3}/V", "priority": "80"},
	"0/269": {"root": "2", "label": "V{ r2}/V", "priority": "80"},
	
	// iii
	
	"4/7z": {"root": "4", "label": "iii", "priority": "3"},
	"7/4z": {"root": "4", "label": "iii{ z}", "priority": "90"},
	"z/47": {"root": "4", "label": "iii{ z4}", "priority": "90"},
	
	"4/27z": {"root": "4", "label": "iii{ u}", "priority": "10"},
	"7/24z": {"root": "4", "label": "iii{ z5}", "priority": "90"},
	"z/247": {"root": "4", "label": "iii{ r3}", "priority": "90"},
	"2/24z": {"root": "4", "label": "iii{ r2}", "priority": "90"},	
	
	"4/8z": {"root": "4", "label": "V/vi", "priority": "80"},
	"8/4z": {"root": "4", "label": "V{ z}/vi", "priority": "80"},
	"z/48": {"root": "4", "label": "V{ z4}/vi", "priority": "80"},
	
	"4/28z": {"root": "4", "label": "V{ u}/vi", "priority": "80"},
	"4/28": {"root": "4", "label": "V{ u3}/vi", "nofifth": "true", "priority": "80"},
	"8/24z": {"root": "4", "label": "V{ z5}/vi", "priority": "80"},
	"z/248": {"root": "4", "label": "V{ r3}/vi", "priority": "80"},
	"2/48z": {"root": "4", "label": "V{ r2}/vi", "priority": "80"},
	
	// IV
	
	"5/09": {"root": "5", "label": "IV", "priority": "1"},
	"9/05": {"root": "5", "label": "IV{ z}", "priority": "4"},
	"0/59": {"root": "0", "label": "IV{ z4}", "priority": "70"},
	
	"5/049": {"root": "5", "label": "IV{ u}", "priority": "10"},
	"9/045": {"root": "5", "label": "IV{ z5}", "priority": "90"},
	"0/459": {"root": "5", "label": "IV{ r3}", "priority": "90"},
	"4/059": {"root": "5", "label": "IV{ r2}", "priority": "90"},
	
	// viio/V is a.k.a. #ivo
	
	"6/09": {"root": "6", "label": "vii&dim;/V", "priority": "80"},
	"9/06": {"root": "6", "label": "vii&dim;{ z}/V", "priority": "80"},
	"0/69": {"root": "6", "label": "vii&dim;{ z4}/V", "priority": "80"},
	
	"6/049": {"root": "6", "label": "vii&hdim;7/V", "priority": "80"},
	"9/046": {"root": "6", "label": "vii&hdim;{ z5}/V", "priority": "80"},
	"0/469": {"root": "6", "label": "vii&hdim;{ r3}/V", "priority": "80"},
	"4/069": {"root": "6", "label": "vii&hdim;{ r2}/V", "priority": "80"},
	
	// V
	
	"7/2z": {"root": "7", "label": "V", "priority": "1"},
	"7/z": {"root": "7", "label": "V{ e}", "nofifth": "true", "priority": "11"},
	"z/27": {"root": "7", "label": "V{ z}", "priority": "4"},
	"2/7z": {"root": "7", "label": "V{ z4}", "priority": "70"},
	
	// "7/02": {"root": "7", "label": "V&54;", "ifProceedsTo": "7/2z", "priority": "70"},
	
	"7/25z": {"root": "7", "label": "V{ u}", "priority": "6"},
	"7/5z": {"root": "7", "label": "V{ u3}", "nofifth": "true", "priority": "6"},
	"7/25": {"root": "7", "label": "V{ u5}", "nothird": "true", "priority": "11"},
	"z/257": {"root": "7", "label": "V{ z5}", "priority": "6"},
	"2/57z": {"root": "7", "label": "V{ r3}", "priority": "9"},
	"5/27z": {"root": "7", "label": "V{ r2}", "priority": "9"},

	// viio/ii
	
	"8/2z": {"root": "1", "label": "vii&dim/vi", "priority": "90"},
	"z/28": {"root": "1", "label": "vii&dim;{ z}/vi", "priority": "80"},
	"2/8z": {"root": "1", "label": "vii&dim;{ z4}/vi", "priority": "90"},

	"8/25z": {"root": "1", "label": "vii&dim;{ u}/vi", "priority": "80"},
   "z/258": {"root": "1", "label": "vii&dim;{ z5}/vi", "priority": "90"},
 	"2/58z": {"root": "1", "label": "vii&dim;{ r3}/vi", "priority": "90"},
	"5/28z": {"root": "1", "label": "vii&dim;{ r2}/vi", "priority": "90"},
	
	// vi
	
	"9/04": {"root": "9", "label": "vi", "priority": "2"},
	"0/49": {"root": "9", "label": "vi{ z}", "priority": "90"},
	"4/04": {"root": "9", "label": "vi{ z4}", "priority": "90"},
	
	"9/047": {"root": "9", "label": "vi{ u}", "priority": "8"},
	"0/479": {"root": "9", "label": "vi{ z5}", "priority": "90"},
	"4/079": {"root": "9", "label": "vi{ r3}", "priority": "90"},
	"7/049": {"root": "9", "label": "vi{ r2}", "priority": "90"},
	
	"9/14": {"root": "9", "label": "V/ii", "priority": "80"},
	"1/49": {"root": "9", "label": "V{ z}/ii", "priority": "80"},
	"4/14": {"root": "9", "label": "V{ z4}/ii", "priority": "80"},
	
	"9/147": {"root": "9", "label": "V{ u}/ii", "priority": "80"},
	"9/17": {"root": "9", "label": "V{ u3}/ii", "nofifth": "true", "priority": "80"},
	"1/479": {"root": "9", "label": "V{ z5}/ii", "priority": "80"},
	"4/179": {"root": "9", "label": "V{ r3}/ii", "priority": "80"},
	"7/149": {"root": "9", "label": "V{ r2}/ii", "priority": "80"},
	
	// viio
		
	"z/25": {"root": "z", "label": "vii&dim;", "priority": "90"},
	"2/5z": {"root": "z", "label": "vii&dim;{ z}", "priority": "5"},
	"5/2z": {"root": "z", "label": "vii&dim;{ z4}", "priority": "90"},

	"z/259": {"root": "z", "label": "vii&hdim;{ u}", "priority": "80"},
	"2/59z": {"root": "z", "label": "vii&hdim;{ z5}", "priority": "90"},
	"5/29z": {"root": "z", "label": "vii&hdim;{ r3}", "priority": "90"},
	"9/25z": {"root": "z", "label": "vii&hdim;{ r2}", "priority": "90"},
	
   // NOTE: the following chords through the end of the table will be respelled. See relevant code.
   
	"8/06": {"root": "2", "label": "It.{ z}", "priority": "85"},
	"8/026": {"root": "2", "label": "Fr.{ z}", "priority": "85"},
	"8/036": {"root": "2", "label": "Ger.{ z}", "priority": "85"},
	"6/038": {"root": "2", "label": "inverted Ger.{ z}", "priority": "85"},
	
	// bII is a.k.a. N
	
	"5/18": {"root": "1", "label": "{C}II{ z}", "priority": "85"},
	"5/018": {"root": "1", "label": "{C}II{ z5}", "priority": "85"},
	"8/03": {"root": "8", "label": "{C}VI", "bymodalmixture": "true", "priority": "85"},
	"0/38": {"root": "8", "label": "{C}VI{ z}", "bymodalmixture": "true", "priority": "85"}
	
	// Note: Other examples of modal mixture cannot be supported because they invoke enharmonic ambiguities.
});
