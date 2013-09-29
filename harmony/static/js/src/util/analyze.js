/* global define: false */
define([
	'lodash',
	'app/config'
], function(
	_,
	Config
) {

	var HIGHLIGHT_COLORS = Config.get('highlight.colors');

	var Analyze = {};

	_.extend(Analyze, {

		// Returns a color as a string value that is intended to highlight 
		// music theory attribute(s) of a given note in a collection of a notes.
		highlightNote: function(highlightMode, keySignature, notes, note) {
			var highlightOctaves = highlightMode['octaves'] ? true : false;
			var highlightTritones = highlightMode['tritones'] ? true : false;
			var highlightDoubles = highlightMode['doubles'] ? true : false;
			var highlightRoots = highlightMode['roots'] ? true : false;

			var color = HIGHLIGHT_COLORS.default;
			var interval = 0;
			var keyPitchClass = keySignature.getKeyPitchClass();
			var fromRoot = this.semitonalDistance(keyPitchClass, note) % 12;
			var i = notes.indexOf(note);

			if (highlightOctaves) {
				for (var j = i, len = notes.length; j < len; j++) {
					interval_up = this.semitonalDistance(notes[i],notes[j]) % 12;
					if (interval_up == 7) {
						color = HIGHLIGHT_COLORS.perfectfifth;
					}
					if (interval_up == 0 && i != j) { // octave
						if (this.colorsEqual(color, HIGHLIGHT_COLORS.perfectfifth)) {
							color = HIGHLIGHT_COLORS.perfectfifthoctave;
						} else { 
							color = HIGHLIGHT_COLORS.octave;
						}
					}
				}
				for (var j = i; j >= 0; j--) {
					interval_down = this.semitonalDistance(notes[i],notes[j]) % 12;
					if (interval_down == 5) {
						if (this.colorsEqual(color, HIGHLIGHT_COLORS.octave)) { 
							color = HIGHLIGHT_COLORS.perfectfifthoctave;
						} else {
							color = HIGHLIGHT_COLORS.perfectfifth; 
						}
					}
					if (interval_down == 0 && i != j) {
						color = HIGHLIGHT_COLORS.octave;
					}
				}
			}
			
			if (highlightTritones) {
				for (var j = i, len = notes.length; j < len; j++) {
					interval_up = this.semitonalDistance(notes[i],notes[j]) % 12;
					if (interval_up == 6) {
						color = HIGHLIGHT_COLORS.tritone;
					}
				}
				for (var j = i; j >= 0; j--) {
					interval_down = this.semitonalDistance(notes[i],notes[j]) % 12;
					if (interval_down == 6) {
						color = HIGHLIGHT_COLORS.tritone;
					}
				}
			}
			if (highlightDoubles) {
				if (keySignature.isMinorKey()) {  		// sharp notes in minor
					if (_.contains([4,6,9,11],fromRoot)) {
						for (var index in notes) {
							if (index != i && (note % 12 == notes[index] % 12)) {
								color = HIGHLIGHT_COLORS.double
							}
						}
					}
				}
				else {
					if (_.contains([1,3,6,8,11],fromRoot)) {		// sharp notes in major
						for (var index in notes) {
							if (index != i && (note % 12 == notes[index] % 12)) {
								color = HIGHLIGHT_COLORS.double;
							}
						}
					}
				}
			}

			if (highlightRoots) {
				// TODO implement algorithm to identify and highlight roots
			}

			if(typeof color !== 'string') {
				color = this.toHSLString(color);
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
		// Returns a color triplet as an HSL string.
		toHSLString: function(color) {
			return 'hsl('+color[0]+','+color[1]+'%,'+color[2]+'%)';
		},
		// Returns true if two colors are the same.
		colorsEqual: function(color1, color2) {
			if(!color1 || !color2) {
				return false;
			}
			return this.toHSLString(color1) === this.toHSLString(color2);
		}
	});

	//--------------------------------------------------
	// Memoize for better performance. 
	//
	Analyze.semitonalDistance = _.memoize(Analyze.semitonalDistance, function(note1, note2) {
		var cacheKey = note1+','+note2;
		return cacheKey;
	});

	Analyze.toHSLString = _.memoize(Analyze.toHSLString, function(color) {
		var cacheKey = color.join(',');
		return cacheKey;
	});

	return Analyze;
});
