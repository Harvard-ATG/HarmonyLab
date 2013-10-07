// Analysis functions
//
// Ported from the old harmony prototype with minimal changes.

/* global define: false */
define([
	'lodash',
	'vexflow',
	'app/config'
], function(
	_, 
	Vex, 
	Config
) {


var ANALYSIS_CONFIG = Config.get('analysis');
var PITCH_CLASSES = Config.get('general.pitchClasses');
var NOTE_NAMES = Config.get('general.noteNames');
var KEY_MAP = Config.get('general.keyMap');
var SPELLING_TABLE = _.reduce(KEY_MAP, function(result, value, key) {
	result[key] = value.spelling;
	return result;
}, {});



var analyzing = {
	keynotePC: {
		"h": 0,
		"jC_":  0,
		"iC_":  0,
		"jC#": 1,
		"iC#": 1,
		"jDb": 1,
		"jD_":  2,
		"iD_": 2,
		"iD#": 3,
		"jEb": 3,
		"iEb": 3,
		"jE_":  4,
		"iE_":  4,
		"jF_":  5,
		"iF_":  5,
		"jF#": 6,
		"iF#": 6,
		"jGb": 6,
		"jG_":  7,
		"iG_":  7,
		"iG#": 8,
		"jAb": 8,
		"iAb": 8,
		"jA_":  9,
		"iA_":  9,
		"iA#": 10,
		"jBb": 10,
		"iBb": 10,
		"jB_":  11,
		"iB_":  11,
		"jCb": 11 
},
AtoGindices: {
		  'a':   { root_index: 0, int_val: 9 },
		  'an':  { root_index: 0, int_val: 9 },
		  'a#':  { root_index: 0, int_val: 10 },
		  'a##': { root_index: 0, int_val: 11 },
		  'ab':  { root_index: 0, int_val: 8 },
		  'abb': { root_index: 0, int_val: 7 },
		  'b':   { root_index: 1, int_val: 11 },
		  'bn':  { root_index: 1, int_val: 11 },
		  'b#':  { root_index: 1, int_val: 0 },
		  'b##': { root_index: 1, int_val: 1 },
		  'bb':  { root_index: 1, int_val: 10 },
		  'bbb': { root_index: 1, int_val: 9 },
		  'c':   { root_index: 2, int_val: 0 },
		  'cn':  { root_index: 2, int_val: 0 },
		  'c#':  { root_index: 2, int_val: 1 },
		  'c##': { root_index: 2, int_val: 2 },
		  'cb':  { root_index: 2, int_val: 11 },
		  'cbb': { root_index: 2, int_val: 10 },
		  'd':   { root_index: 3, int_val: 2 },
		  'dn':  { root_index: 3, int_val: 2 },
		  'd#':  { root_index: 3, int_val: 3 },
		  'd##': { root_index: 3, int_val: 4 },
		  'db':  { root_index: 3, int_val: 1 },
		  'dbb': { root_index: 3, int_val: 0 },
		  'e':   { root_index: 4, int_val: 4 },
		  'en':  { root_index: 4, int_val: 4 },
		  'e#':  { root_index: 4, int_val: 5 },
		  'e##': { root_index: 4, int_val: 6 },
		  'eb':  { root_index: 4, int_val: 3 },
		  'ebb': { root_index: 4, int_val: 2 },
		  'f':   { root_index: 5, int_val: 5 },
		  'fn':  { root_index: 5, int_val: 5 },
		  'f#':  { root_index: 5, int_val: 6 },
		  'f##': { root_index: 5, int_val: 7 },
		  'fb':  { root_index: 5, int_val: 4 },
		  'fbb': { root_index: 5, int_val: 3 },
		  'g':   { root_index: 6, int_val: 7 },
		  'gn':  { root_index: 6, int_val: 7 },
		  'g#':  { root_index: 6, int_val: 8 },
		  'g##': { root_index: 6, int_val: 9 },
		  'gb':  { root_index: 6, int_val: 6 },
		  'gbb': { root_index: 6, int_val: 5 }
	},
AtoGnames: ["a","b","c","d","e","f","g"],
AtoGsemitoneIndices: [9, 11, 0, 2, 4, 5, 7],
// "jEnharmonicAlterations" changes the spelling of some chords in major keys and uses "pushFlatward" to do this.
// As written here, it returns the proper spelling for augmented sixths, Neapolitan chords, and bVI.
// ("pushSharpward" is currently inactive.)

	jEnharmonicAlterations: function (note, noteName, chord) {
		var noteValue = (12 + note - this.Piano.keynotePC) % 12;
		var oldNote = noteName;
		var pitches = [];

		for (var pitch in chord) {
			var newNote = chord[pitch] % 12;
			newNote = (12 + newNote - this.Piano.keynotePC) % 12;
			pitches.push(newNote);
		}

		if (_.contains(pitches,1) && _.contains(pitches,8)) {
			if (noteValue == 1 || noteValue == 8) {
				noteName = this.pushFlatward(note,noteName);
			}
		}
		if (_.contains(pitches,0) && _.contains(pitches,6) && _.contains(pitches,8) && noteValue == 8) {
			noteName = this.pushFlatward(note,noteName);
		}
		if (_.contains(pitches,3) && _.contains(pitches,8)) {
			if (noteValue == 3 || (noteValue == 8 && !_.contains(pitches,6) && !_.contains(pitches,1))) {
 				noteName = this.pushFlatward(note,noteName);
			}
		}

		return noteName;
	},
	pushFlatward: function (note, noteName) {
		var AtoGIndex = this.AtoGindices[noteName.toLowerCase()].root_index;
		AtoGIndex = (AtoGIndex + 1) % 7;
		noteName = this.getRelativeNoteName(AtoGIndex, note % 12);
		return noteName;
	},
	pushSharpward: function (note, noteName) {
		var AtoGIndex = this.AtoGindices[noteName.toLowerCase()].root_index;
		AtoGIndex = (7 + AtoGIndex - 1) % 7;
		noteName = this.getRelativeNoteName(AtoGIndex, note % 12);
		return noteName;
	},

	getRelativeNoteName: function (AtoGindex, semitones) {
		var interval = semitones - this.AtoGsemitoneIndices[AtoGindex];
		var relativeNoteName = this.AtoGnames[AtoGindex];

		  if (Math.abs(interval) > 9 ) {
			    var multiplier = 1;
			    if (interval > 0 ) multiplier = -1;

			    // Possibly wrap around. (Add +1 for modulo operator)
			    var reverse_interval = (((semitones + 1) + (this.AtoGsemitoneIndices[AtoGindex] + 1)) %
			      12) * multiplier;

			      interval = reverse_interval;
			  }

		if (interval > 0) {
			for (var i = 1; i <= interval; ++i)
				relativeNoteName += "#";
		} else if (interval < 0) {
			for (var i = -1; i >= interval; --i)
				relativeNoteName += "b";
		}

		return relativeNoteName;

	},
// "ColorSpectacular" colors in selected pitches on the sheet music to highlight certain musical phenomena;
// it depends on "knowStepwiseDistance" and "knowSemitonalDistance."

	ColorSpectacular: function (note, notes) {
		var color = "black";
		var interval = 0;
		var fromRoot = this.knowSemitonalDistance(this.Piano.keynotePC, note) % 12;
		var i = notes.indexOf(note);
		if (this.Piano.highlightMode["octaveshighlight"]) {
		for (var j = 1; j < notes.length; j++) {
			interval_up = this.knowSemitonalDistance(notes[i],notes[i + j]) % 12;
			if (interval_up == 7) color = "green"; // perfect fifth
			if (interval_up == 0 && i != (i+j)) { // octave
				if (color == "green") color = "#099"
				else color = "blue"; 
			}
		}
		for (var j = i; j > 0; j--) {
			interval_down = this.knowSemitonalDistance(notes[i],notes[i - j]) % 12;
			if (interval_down == 5) {
				if (color == "blue") color = "#099";
				else color = "green"; // perfect fifth
			}
			if (interval_down == 0 && i != (i-j)) color = "blue";
			}
		}
		
		if (this.Piano.highlightMode["tritonehighlight"]) {
		for (var j = 1; j < notes.length; j++) {
			interval_up = this.knowSemitonalDistance(notes[i],notes[i + j]) % 12;
			if (interval_up == 6) color = "#d29"; // tritone
		}
		for (var j = i; j > 0; j--) {
			interval_down = this.knowSemitonalDistance(notes[i],notes[i - j]) % 12;
			if (interval_down == 6) color = "#d29"; // tritone
			}
		}
		if (this.Piano.highlightMode["doublinghighlight"]) {
			if (this.Piano.key.indexOf('i') != -1) { 		// sharp notes in minor
				if (_.contains([4,6,9,11],fromRoot)) {
					for (var index in notes) {
						if (index != i && (note % 12 == notes[index] % 12)) color = "orange";
					}
				}
			}
			else {
				if (_.contains([1,3,6,8,11],fromRoot)) {		// sharp notes in major
					for (var index in notes) {
						if (index != i && (note % 12 == notes[index] % 12)) color = "orange";
					}
				}
			}
			
//			var root = this.findRoot(notes);		// THERE ARE MUSIC-THEORETICAL PROBLEMS WITH THESE FIVE LINES OF CODE
//			var interval = this.knowSemitonalDistance(note,root) % 12;
//			console.log(interval);
//			if (interval == 1 || interval == 2 || interval == 10 || interval == 11) {
//					for (var index in notes) {
//						if (index != i && (note % 12 == notes[index] % 12)) color = "orange";
//					}
//			}
		}
		
//		if (this.Piano.getSheetMusicMode() == "thoroughbass" && note != notes[0]) {
//			var colorTranslate = {"black": "rgba(0,0,0,0.4)", "orange": "rgba(255,165,0,0.4)", "#d29": "rgba(221,34,153,0.4)",
//			"blue": "rgba(0,0,255,0.4)", "green": "rgba(0,255,0,0.4)", "#099": "rgba(0,153,153,0.4)"};
//			color = colorTranslate[color];
//		}

		return color;
	},
	knowStepwiseDistance: function (chord, noteName1, noteName2) {
		var AtoGindex1 = this.AtoGindices[noteName1[0].toLowerCase()].root_index;
		var AtoGindex2 = this.AtoGindices[noteName2[0].toLowerCase()].root_index;
		var semitones = chord[1] - chord[0];
		var steps = (7 + AtoGindex2 - AtoGindex1) % 7;
		steps += Math.round(semitones/12) * 7;
		return steps;
	},
	knowSemitonalDistance: function (note1, note2) {
		var distance = note2 - note1;
		while (distance < 0) {
			distance += 12;
		}
		return distance;
	},
	noteFromSemitonalAndStepwiseDistance: function (bassValue, bassName, semitones, steps) {
		semitones = parseInt(semitones);
		steps = parseInt(steps);
//		console.log(bassValue, bassName, semitones, steps);
		var AtoGindex1 = this.AtoGindices[bassName.toLowerCase()].root_index;
		var note = (bassValue + semitones) % 12;
		var AtoGindex2 = (AtoGindex1 + steps) % 7;
		var newNote = this.getRelativeNoteName(AtoGindex2, note)

		return newNote;
		
	},

// The following eleven scripts do important thinking about pitches, accidentals, roots.

	toHelmholtzNotation: function (note) {
		noteName = note.split('/')[0]
		noteName = noteName[0].toUpperCase() + noteName.slice(1)
		var octave = parseInt(note.split('/')[1]);
		switch (octave) {
			case 0: 
				noteName = noteName+' ,,';
				break;
			case 1: 
				noteName = noteName+' ,';
				break;
			case 2:
				break;
			case 3:
				noteName = noteName.toLowerCase();
				break;
			default:
				noteName = noteName.toLowerCase() + ' '+ Array(octave-2).join("'");
				break;
		}
		return noteName;
	},
	stripRepeatedPitchClasses: function (notes) {
		var dict = {};
		var stripped = [];
		for (var note in notes) {
			dict[notes[note] % 12] = true;
		}
	
		for (var note in notes) {
			var pitch = dict[notes[note] % 12];
			if (pitch != undefined) stripped.push(notes[note]);
			delete dict[notes[note] % 12];
		}
		
		return stripped;
	},
	findRoot: function (notes) {
		var root = null;
		if (this.Piano.key != "h") {
			var entry = this.getOrderedPitchClasses(notes);

			if (this.Piano.key.indexOf('i') == -1) { // major
				if (this.jChords[entry] != undefined) root = this.jChords[entry]["root"];
			}
			else {
				if (this.iChords[entry] != undefined) root = this.iChords[entry]["root"];
			}
			if (root == null || root == "_") return undefined;
			root = this.pitchClasses.indexOf(root);
			root = (root + this.Piano.keynotePC) % 12;
			var roots = [];
			for (var note in notes) {
				if (notes[note] % 12 == root) roots.push(notes[note]);
			}
			root = Math.min(roots);
		}
		else {
			var entry = this.getIntervalsAboveBass(notes);
			if (this.hChords[entry] != undefined) {
				root = parseInt(this.hChords[entry]["root"]);
			}
			var roots = [];
			for (var note in notes) {
				if ((12 + notes[note] - notes[0]) % 12 == root) roots.push(notes[note]);
			}
			root = Math.min(roots);
		}
		return root;
	},
	nameNotes: function (notes) {
		var noteString = "";
		if (typeof notes == 'number') {
			noteString = this.noteNames[notes % 12];
		}
		else {
			for (var note in notes) {
				noteString += this.noteNames[notes[note] % 12];
				noteString += " ";
			}
		}
	
		return noteString;
	},
	getOrderedPitchClasses: function (notes) {
		var uniquePitches = this.stripRepeatedPitchClasses(notes);
		var intervals = [];
		
		uniquePitches = uniquePitches.map(function (x) { return (12 + x - this.Piano.keynotePC) % 12;});
		var bass = this.pitchClasses[uniquePitches[0]];
		uniquePitches = uniquePitches.slice(1);
		uniquePitches.sort(function (a,b) { return a-b;});
		for (var i = 0; i < uniquePitches.length; i++) {
			intervals.push(this.pitchClasses[uniquePitches[i]]);
		}
		
		var entry = "";
		if (this.Piano.key != "h") entry = bass + "/" + intervals.join('');
		else entry = intervals.join('');
		return entry;
	},
	getIntervalsAboveBass: function (notes) {
		var uniquePitches = this.stripRepeatedPitchClasses(notes);
		var intervals = [];
		
		var bass = uniquePitches[0] % 12;
		uniquePitches = uniquePitches.slice(1);
		uniquePitches.sort(function (a,b) { return a-b;});
		for (var i = 0; i < uniquePitches.length; i++) {
			intervals.push(this.pitchClasses[(12 + uniquePitches[i] - bass) % 12]);
		}
		
		var entry = intervals.join('');
		return entry;
	},
	getLabel: function (notes) {
			var entry = this.getIntervalsAboveBass(notes);
			
			if (this.hChords[entry]) quality = this.hChords[entry]["label"];
			else quality = "";
			return quality;
			
	},
	getNoteName: function (note, chord, called) {
		if (this.Piano.key != "h") {
			var name = this.spelling[this.Piano.key][note % 12].toLowerCase();

			if (this.Piano.key.indexOf('i') == -1) {
				name = this.jEnharmonicAlterations(note, name, chord); // major only modifications; index changed from m to i -Rowland
			}
		}
		else {
			var bassValue = chord[0];
			if (chord.length == 1) {
				var name = this.noteNames[note % 12];
			}
			if (chord.length == 2) {
				var interval = chord[1]-chord[0];
				if (this.hIntervals[interval]) {
					if (this.hIntervals[interval]["spellbass"] != "___")
						var bassName = this.spelling[this.hIntervals[interval]["spellbass"]][chord[0] % 12];
					else var bassName = this.noteNames[chord[0] % 12];
					bassName = bassName.toLowerCase();
					if (note == chord[1])
						var step = this.hIntervals[interval]["stepwise"];
					else var step = 0;
					var name = this.noteFromSemitonalAndStepwiseDistance(chord[0], bassName, note - chord[0], step);
				}
				else var name = this.noteNames[note % 12];
			}
			if (chord.length > 2) {
				var entry = this.getIntervalsAboveBass(chord);
				var chordEntry = this.hChords[entry];
				var steps = "";
				if (chordEntry != undefined) {
					steps = chordEntry["stepwise"];
					if (chordEntry["spellbass"] != "___") {
						var bassName = this.spelling[chordEntry["spellbass"]][chord[0] % 12];
						bassName = bassName.toLowerCase();
						var semitonesFromBass = (12 + note - chord[0]) % 12;
						var index = entry.indexOf(this.pitchClasses[semitonesFromBass]);
						stepsFromBass = this.pitchClasses.indexOf(steps[index]);
						if (index == -1) stepsFromBass = 0;
						var name = this.noteFromSemitonalAndStepwiseDistance(chord[0], bassName, semitonesFromBass, stepsFromBass);
					}
					else var name = this.noteNames[note % 12];
				}
				else var name = this.noteNames[note % 12];

			}
//			if (_.contains([1,3,6,8,10], rootValue % 12)) {
//			if (this.Piano.spellSharp && rootName.indexOf("#") == -1) rootName = this.pushSharpward(rootValue,rootName);
//			else if (this.Piano.spellFlat && rootName.lastIndexOf("b") < 1) rootName = this.pushFlatward(rootValue,rootName);
//			}


			if (name == null || name == undefined || name == "") var name = this.noteNames[note % 12];
		}

		name = name.toLowerCase();
		var octave = Math.floor(note/12) - 1;
		// octave is calculated wrong if note is Cb/Cbb/B#/B##
		if (name == "cb" || name == "cbb") octave++;
		if (name == "b#" || name == "b##") octave--;
		return name + "/" + octave;
	},
	getAccidentalOfNote: function(vexnote) {
		vexnote = vexnote.toLowerCase();
		var regex = /^([cdefgab])(b|bb|n|#|##)?\/.*$/;
		var match = regex.exec(vexnote);
		if (match[2] != undefined) return match[2];
		else return "";
	},
	permute: function(v, m){	// v is the array; if m is 0, return values, else return indices
		for(var p = -1, j, k, f, r, l = v.length, q = 1, i = l + 1; --i; q *= i);
		for(x = [new Array(l), new Array(l), new Array(l), new Array(l)], j = q, k = l + 1, i = -1;
			++i < l; x[2][i] = i, x[1][i] = x[0][i] = j /= --k);
		for(r = new Array(q); ++p < q;)
			for(r[p] = new Array(l), i = -1; ++i < l; !--x[1][i] && (x[1][i] = x[0][i],
				x[2][i] = (x[2][i] + 1) % l), r[p][i] = m ? x[3][i] : v[x[3][i]])
				for(x[3][i] = x[2][i], f = 0; !f; f = !f)
					for(j = i; j; x[3][--j] == x[2][i] && (x[3][i] = x[2][i] = (x[2][i] + 1) % l, f = 1));
		return r;
	},

// "distance" is used by "ijNameDegree," "ijFindChord," and "\notate.drawBassNoteSolfege."

	distance: function (notes) {
			var semitones = notes[1] - notes[0];
			var AtoGindex1 = this.AtoGindices[this.getNoteName(notes[0],notes).split('/')[0].toLowerCase()].root_index;
			var AtoGIndex2 = this.AtoGindices[this.getNoteName(notes[1],notes).split('/')[0].toLowerCase()].root_index;
			var steps = (7 + AtoGIndex2 - AtoGindex1) % 7;
			steps += Math.floor(semitones/12) * 7;
			while (semitones < 0) {
				semitones += 12;
				if (steps != 6) steps += 7;
			}
			return semitones.toString() + '/' + steps.toString();
	},

// The scripts "ijNameDegree," "ijFindChord," and "hFindChord" return the analysis of scale degrees and chords.
// They draw on the customizable listings of "jDegrees," (not "iDegrees" currently), "iChords," and "jChords."
// They also draw on many scripts here and in "\this.Piano."

	ijNameDegree: function (notes) {
		if (notes.length == 1) {
			if (this.Piano.key != "h" && !this.Piano.analysisMode["note names"]) {
				var i = this.distance([this.Piano.keynotePC,notes[0] % 12]);
//				var name = this.toHelmholtzNotation(this.getNoteName(notes[0],notes))+"<br><br>";
				var numeral = ""
				if (this.jDegrees[i] != undefined) {
					numeral = this.jDegrees[i]["numeral"];
					if (this.Piano.key.indexOf("i") != -1) {	// minor key variations; index changed to i from m -Rowland
						if (numeral == "b3") numeral = '3';
						else if (numeral == "3") numeral = '#3';
						else if (numeral == "b6") numeral = '6'
						else if (numeral == "6") numeral = '#6'
						else if (numeral == "b7") numeral = '7';
						else if (numeral == "7") numeral = '#7';
					}
					return { "name": this.jDegrees[i]["solfege"], "numeral": numeral };
				}
			}
			else if (this.Piano.analysisMode["note names"] && this.Piano.key != "h") {
				return {"name": this.spelling[this.Piano.key][notes[0] % 12] };
			}
			else if (this.Piano.analysisMode["note names"] && this.Piano.key == "h") {
				return {"name": this.nameNotes(notes) };
			}
			else {
				return this.nameNotes(notes[0]);
			}
		}
		else if (notes.length == 2) {
			var i =  this.distance(notes);
			if (this.ijIntervals[i]) return {"name": this.ijIntervals[i], "numeral": null };
			else return {"name": "", "numeral": null};
		}
	},
	ijFindChord: function (notes) {
		if (notes.length == 1) return this.toHelmholtzNotation(this.getNoteName(notes[0],notes));
		else if (notes.length == 2) {
			var i = this.distance(notes);
			if (this.ijIntervals[i]) return this.ijIntervals[i];
		}
		else var entry = this.getOrderedPitchClasses(notes);
		if (this.Piano.key.indexOf('i') != -1) { // minor
			try { return this.iChords[entry]; } catch (e) {return undefined;}
		}
		else {
			try { return this.jChords[entry]; } catch (e) {return undefined;}
		}
	},
	hFindChord: function (notes) {
		if (notes.length == 1) var name = this.toHelmholtzNotation(this.getNoteName(notes[0],notes));
		else if (notes.length == 2) {
			var i = notes[1] - notes[0];
			if (this.hIntervals[i]) var name = {"label": this.hIntervals[i]};
		}
		else {
			var entry = this.getIntervalsAboveBass(notes);
			var chordEntry = clone(this.hChords[entry]);
			if (chordEntry != undefined) {
				var name = chordEntry["label"];
				if (chordEntry["spellbass"] != "___")
					var bassName = this.spelling[chordEntry["spellbass"]][notes[0] % 12];
				else {		// fully diminished seventh
					name = chordEntry;
					return name;
				}
				if (chordEntry["root"] != "_")
					var rootName = this.noteFromSemitonalAndStepwiseDistance(notes[0], bassName,
						chordEntry["root"], chordEntry["rootstepwise"]);	
					var bassName = "";		// not finding it yet
//			if (_.contains([1,3,6,8,10],rootValue % 12)) {
//				if (this.Piano.spellSharp && rootName.indexOf("#") == -1) rootName = this.pushSharpward(rootValue,rootName);
//				else if (this.Piano.spellFlat && rootName.lastIndexOf("b") < 1) rootName = this.pushFlatward(rootValue,rootName);
//			}
				if (name.indexOf("&R") != -1) name = name.replace(/\&R/,rootName[0].toUpperCase() + rootName.slice(1));
				if (name.indexOf("&r") != -1) name = name.replace(/\&r/,rootName.toLowerCase());
				if (name.indexOf("&X") != -1) name = name.replace(/\&X/,bassName[0].toUpperCase() + bassName.slice(1));
				if (name.indexOf("&x") != -1) name = name.replace(/\&x/,bassName.toLowerCase());
				chordEntry["label"] = name;
				name = chordEntry;
			}
			else var name = undefined;
		}
		return name;
	},

// The scripts "figureIsAltered," "abbreviateFigures," and "matchAltered" do the thinking for figured bass notation.
// They are all used by "\notate.annotate."
// The small scripts "upHalfStep" and "downHalfStep" serve "figureIsAltered" exclusively.
// "figureIsAltered" also depends on several scrips here and in "\this.Piano."
// "abbreviateFigures" depends on "matchAltered" and (for French throughbass) on "isDominantSeventh."

	upHalfStep: function (note, noteName) {
		var AtoGIndex = this.AtoGindices[noteName.toLowerCase()].root_index;
		noteName = this.getRelativeNoteName(AtoGIndex, (note+1) % 12);
		return noteName;
	},
	downHalfStep: function (note, noteName) {
		var AtoGIndex = this.AtoGindices[noteName.toLowerCase()].root_index;
		noteName = this.getRelativeNoteName(AtoGIndex, (note-1) % 12);
		return noteName;
	},
	figureIsAltered: function (note, name, bassName, interval) { // (chord,noteName1, noteName2) {
		var altered = false;
		if (this.Piano.key == "h") {
			this.Piano.getKeySignature("jC_");
		}
			noteName = name.split('/')[0];
			var noteIndex = this.Piano.diatonicNotes.indexOf(noteName);
			var sharp = this.downHalfStep(note, noteName);
			var sharpIndex = this.Piano.diatonicNotes.indexOf(sharp.split('/')[0]);
			var flat = this.upHalfStep(note, noteName);
			var flatIndex = this.Piano.diatonicNotes.indexOf(flat.split('/')[0]);
			var direction = 0;
			if (noteIndex != -1) altered = '';
			else if (sharpIndex != -1) {
				if (noteName.indexOf("##") != -1) altered = '##';
				else if (noteName.indexOf("#") != -1) altered = '#';
				else if (noteName.indexOf("#") == -1) altered = 'n';
				direction = '+';	// sharp
			}
			else if (flatIndex != -1) {
				if (noteName != 'bb' && noteName.indexOf("bb") != -1) altered = 'bb';
				else if (noteName.indexOf("b") != -1) altered = 'b';
				if (noteName.indexOf("b") == -1) altered = 'n';
				direction = '-'; // flat
			}
			if (interval == '8') {
				if (this.getAccidentalOfNote(bassName) == this.getAccidentalOfNote(name)) {
					altered = '';
					direction = '0';
				}
				else {
					var acc = this.getAccidentalOfNote(name);
					if (acc == '') acc = 'n';
					altered = acc;
					if (acc == "#" || acc == "##") direction = '+';
					if (acc == "b" || acc == "bb") direction = '-';
				}
			}
//			console.log(noteName,noteIndex,flatted,sharped);
//		console.log(altered);
		return { "altered": altered, "direction": direction};
	},
	matchAltered: function (steps, query) {
		var result = false;
		if (typeof query == "number" || typeof query == "string") {
			if (steps.indexOf(query) != -1) result = true;
			else if (steps.indexOf(query+"+") != -1) result = true;
			else if (steps.indexOf("b"+query) != -1) result = true;
			else if (steps.indexOf("#"+query) != -1) result = true;
		}
		else {
			for (var i in query) {
				if (_.contains(steps,query[i]) || _.contains(steps,query[i]+"+") || _.contains(steps,"#"+query[i]) || _.contains(steps,"n"+query[i]) || _.contains(steps,"b"+query[i])) {
					result++;
				}
			}
			if (result == query.length && steps.length == query.length) result = true;
			else result = false;
		}
		
		return result;
	},
	abbreviateFigures: function (steps, intervals, notes) {
		for (var i in steps) {
			if (intervals[steps[i]] != undefined) {
				if ((intervals[steps[i]]['direction'] == '+') && steps[i].indexOf('4') != -1) steps[i] = "4+";
				else if ((intervals[steps[i]]['direction'] == '+') && steps[i].indexOf('5') != -1) steps[i] = "5+";
				else if ((intervals[steps[i]]['direction'] == '+') && steps[i].indexOf('6') != -1) steps[i] = "6+";
			}
			if (steps[i] == "8") steps.splice(i,1);
		}
		if (this.matchAltered(steps,["7","5","3"])) {
			if (steps.indexOf("3") != -1 && steps.indexOf("5") != -1) {	// 3 and 5 have no accidentals
				steps[steps.indexOf("3")] = "[3]";
			}
			
			if (steps.indexOf("5") != -1) {	// 5 has no accidental
				steps[steps.indexOf("5")] = "[5]";
			}
		}
		else if (this.matchAltered(steps,["6","5","3"])) {
			if (steps.indexOf("3") != -1) {	// 3 has no accidental
				steps[steps.indexOf("3")] = "[3]";
			}
		}
		
		else if (this.matchAltered(steps,["6","4","3"])) {
			if (steps.indexOf("6") != -1) {	// 6 has no accidental
				steps[steps.indexOf("6")] = "[6]";
			}
		}
		
		else if (this.matchAltered(steps,["6","4","2"])) {
			if (steps.indexOf("6") != -1) {	// 6 has no accidental
				steps[steps.indexOf("6")] = "[6]";
			}
		
		}
		else if (this.matchAltered(steps,["6","3"])) {
			if (steps.indexOf("3") != -1) {	// 3 has no accidental
				steps[steps.indexOf("3")] = "[3]";
			}			
		}
		else if (this.matchAltered(steps,["5","3"])) {
			if (steps.indexOf("5") != -1 && steps.indexOf("3") != -1) {	// 3 and 5 have no accidental
				steps[steps.indexOf("5")] = "[5]";
				steps[steps.indexOf("3")] = "[3]";
			}
			else if (steps.indexOf("5") != -1) {
							steps[steps.indexOf("5")] = "[5]";
			}
		}
		else if (this.matchAltered(steps,["5","4"])) {
			if (steps.indexOf("5") != -1 && steps.indexOf("4") != -1) {	// 4 and 5 have no accidental
				steps[steps.indexOf("5")] = "[5]";
			}
		}
		else if (this.matchAltered(steps,["9","5","3"])) {
			if (steps.indexOf("5") != -1) {	// 5 has no accidental
				steps[steps.indexOf("5")] = "[5]";
			}
			if (steps.indexOf("3") != -1 && steps.indexOf("[5]") != -1) {	// 3 or 5 have no accidental
				steps[steps.indexOf("3")] = "[3]";
			}
		}
		else if (this.matchAltered(steps,["7","3"])) {
			if (steps.indexOf("3") != -1) {	// 3 has no accidental
				steps[steps.indexOf("3")] = "[3]";
			}
		}
		for (var i in steps) {	
			if (steps[i] == "#3" && steps.length > 1) steps[i] = "#";
			if (steps[i] == "n3" && steps.length > 1) steps[i] = "n";
			if (steps[i] == "b3" && steps.length > 1) steps[i] = "b";
//			if (steps[i] == "7" && intervals[steps[i]]['semitones'] == 9) steps[i] = "\xb07";
		}
				
		if (_.contains(steps,"9") && _.contains(steps,"2")) {
			steps = steps.filter(function (a) { return a != "9"; });
		}
		if (this.Piano.frenchThoroughbass) {
			if (arraysAreEqual(steps,['[6]','4+','2'])) {
				steps[steps.indexOf('2')] = '[2]';
			}
			if (arraysAreEqual(steps,['[6]','4','2'])) {
				steps[steps.indexOf('4')] = '[4]';
			}
			if (arraysAreEqual(steps,['6','5','[3]']) || arraysAreEqual(steps,['6','5','n']) || arraysAreEqual(steps,['6','5','b']) || arraysAreEqual(steps,['6','5','#'])) {
				if (this.isDominantTetrad(notes)) steps = ['/5'];
			}
		}

		return steps;
	},

// "isDominantTetrad" is used for French thoroughbass by "abbreviateFigures"

	isDominantTetrad: function (notes) {
		// REDO
	},

// "isDiminishedTetrad" is used for thoroughbass by "\notate.annotate"

	isDiminishedTetrad: function (notes, steps) {
		//REDO
	},

	generateDiatonicNotes: function(key) {
		var keyName = key.slice(1).replace('_','').toLowerCase();
		var roots = Vex.Flow.Music.roots;
		var mus = new Vex.Flow.Music();
		var diatonicNotes = Array(7);
		var i, keyValue, scaleTones, intervals, startingNote;

		if (keyName == "h") { 
			keyName = "c";
		}

		try {
			keyValue = mus.getNoteValue(keyName);
		} catch(e) {
			keyName = "c";
			keyValue = mus.getNoteValue("c");
		}

		if (key.indexOf('j') != -1) {
			intervals = [2, 2, 1, 2, 2, 2, 1];	// major diatonic
		}
		if (key.indexOf('i') != -1) {
			intervals = [2, 1, 2, 2, 1, 2, 2];	// minor diatonic
		}
		
		scaleTones = mus.getScaleTones(keyValue, intervals)
		startingNote = roots.indexOf(keyName[0]);

		for(i = 0; i < 7; i++) {
			diatonicNotes[i] = roots[(i + startingNote) % 7];
		}
		
		for(i in scaleTones) {
			diatonicNotes[i] = mus.getRelativeNoteName(diatonicNotes[i],scaleTones[i]);
		}

		return diatonicNotes;
	}
};

// Constructor for an object that wrap all the analysis methods and
// configuration data.
var Analyze = function(keySignature, options) {
	if(!keySignature) {
		throw new Erorr("missing key signature");
	}

	var keynotePC = keySignature.getKeyPitchClass();
	var key = keySignature.getKey();

	// There used to be a global variable "Piano" in the old harmony prototype
	// that contained various properties and global settings. In order to keep
	// the analysis methods relatively intact when porting from the old
	// prototype app to the new one, a decision was made to provide a local object to 
	// stand in for the old one. Eventually, this should be completely
	// refactored.

	this.Piano = {
		key: key,
		keynotePC: keynotePC,
		diatonicNotes: this.generateDiatonicNotes(key),
		highlightMode: {
			"octaveshighlight": false,
			"doublinghighlight": false,
			"tritonehighlight": false,
			"octaveshighlight": false
		},
		analysisMode: {
			"none": false, 
			"note names": false, 
			"scale degrees": false, 
			"roman numerals": false, 
			"thoroughbass": false
		}
	};

	if(options.highlightMode) {
		_.extend(this.Piano.highlightMode, options.highlightMode);
	}
};


// Augment prototype with methods and configuration data shared by all instances
_.extend(Analyze.prototype, {
	noteNames: NOTE_NAMES,
	pitchClasses: PITCH_CLASSES,
	spelling: SPELLING_TABLE
});
_.extend(Analyze.prototype, ANALYSIS_CONFIG);
_.extend(Analyze.prototype, analyzing);



// Static utility method
Analyze.toHSLString = function(color) {
	return 'hsl('+color[0]+','+color[1]+'%,'+color[2]+'%)';
};


return Analyze;
});
