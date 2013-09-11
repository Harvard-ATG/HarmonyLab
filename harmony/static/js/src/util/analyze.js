/* global define: false */
define([
	'lodash',
	'app/config'
], function(
	_,
	Config
) {

	var Analyze = {};

	_.extend(Analyze, {

		defaultHighlightColor: 'black',

		// Returns a color as a string value that is intended to highlight 
		// music theory attribute(s) of a given note in a collection of a notes.
		highlightNote: function(highlightMode, keySignature, notes, note) {
			var highlightOctaves = highlightMode['octaves'] ? true : false;
			var highlightTritones = highlightMode['tritones'] ? true : false;
			var highlightDoubles = highlightMode['doubles'] ? true : false;
			var highlightRoots = highlightMode['roots'] ? true : false;

			var color = this.defaultHighlightColor;
			var interval = 0;
			var keyPitchClass = keySignature.getKeyPitchClass();
			var fromRoot = this.semitonalDistance(keyPitchClass, note) % 12;
			var i = notes.indexOf(note);

			if (highlightOctaves) {
				for (var j = i, len = notes.length; j < len; j++) {
					interval_up = this.semitonalDistance(notes[i],notes[j]) % 12;
					if (interval_up == 7) {
						color = "green"; // perfect fifth
					}
					if (interval_up == 0 && i != j) { // octave
						if (color == "green") {
							color = "#099"
						} else { 
							color = "blue";
						}
					}
				}
				for (var j = i; j >= 0; j--) {
					interval_down = this.semitonalDistance(notes[i],notes[j]) % 12;
					if (interval_down == 5) {
						if (color == "blue") {
							color = "#099";
						} else {
							color = "green"; // perfect fifth
						}
					}
					if (interval_down == 0 && i != j) {
						color = "blue";
					}
				}
			}
			
			if (highlightTritones) {
				for (var j = i, len = notes.length; j < len; j++) {
					interval_up = this.semitonalDistance(notes[i],notes[j]) % 12;
					if (interval_up == 6) {
						color = "#d29"; // tritone
					}
				}
				for (var j = i; j >= 0; j--) {
					interval_down = this.semitonalDistance(notes[i],notes[j]) % 12;
					if (interval_down == 6) {
						color = "#d29"; // tritone
					}
				}
			}
			if (highlightDoubles) {
				if (keySignature.isMinorKey()) {  		// sharp notes in minor
					if (_.contains([4,6,9,11],fromRoot)) {
						for (var index in notes) {
							if (index != i && (note % 12 == notes[index] % 12)) {
								color = "orange";
							}
						}
					}
				}
				else {
					if (_.contains([1,3,6,8,11],fromRoot)) {		// sharp notes in major
						for (var index in notes) {
							if (index != i && (note % 12 == notes[index] % 12)) {
								color = "orange";
							}
						}
					}
				}
			}

			if (highlightRoots) {
				// TODO implement algorithm to identify and highlight roots
			}

			return color;
		},
		// Returns a positive integer that is the distance in semitones between
		// two notes. Expects each note to be expressed as a MIDI note number.
		semitonalDistance: function (note1, note2) {
			var distance = note2 - note1;
			while (distance < 0) {
				distance += 12;
			}
			return distance;
		},

	});

	//--------------------------------------------------
	// Memoize semitonalDistance for better performance. It is called repeatedly
	// with a small range of inputs in the highlight notes method so it is a
	// good candidate for memoization. 
	Analyze.semitonalDistance = _.memoize(Analyze.semitonalDistance, function(note1, note2) {
		var cacheKey = note1+','+note2;
		console.log(cacheKey);
		return cacheKey;
	});

	return Analyze;
});
