/* global define: false */ 
define([
	'lodash', 
	'vexflow',
	'app/util/analyze',
], function(_, Vex, Analyze) {
	"use strict";

	// This object is responsible for knowing how to create stave notes
	// to populate a stave.
	//
	// In addition to the basic responsibility of creating notes with the
	// proper accidentals/modifiers, it should also know how to highlight
	// notes in different colors.
	// 
	var StaveNoteFactory = function(config) {
		this.init(config);
	};

	_.extend(StaveNoteFactory.prototype, {
		init: function(config) {
			this.config = config;
			this.initConfig();
		},
		initConfig: function() {
			var required = ['chord', 'keySignature', 'clef', 'highlights'];
			_.each(required, function(propName) {
				if(this.config.hasOwnProperty(propName)) {
					this[propName] = this.config[propName];
				} else {
					throw new Error("missing required config property: "+propName);
				}
			}, this);
		},


		//--------------------------------------------------
		// Public methods

		// returns an array of Vex.Flow.StaveNote objects
		createStaveNotes: function() {
			var note_struct = this._getNoteKeysAndModifiers();
			var stave_note = this._makeStaveNote(note_struct.keys, note_struct.modifiers);
			return [stave_note];
		},
		// returns true if there are any stave notes to create, false otherwise
		hasStaveNotes: function() {
			return this.chord.hasNotes(this.clef);
		},

		//--------------------------------------------------
		// Private methods

		// returns a list of key names for this stave only ["note/octave", ...] 
		_getNoteKeys: function() {
			var keySignature = this.keySignature;
			var clef = this.clef;
			var pitches = this.chord.getNotePitches(this.clef);
			var spelling = keySignature.getSpelling();
			var note, pitchClass, octave;
			var note_keys = [];

			for(var i = 0, len = pitches.length; i < len; i++) {
				pitchClass = pitches[i].pitchClass;
				octave = pitches[i].octave;
				note = spelling[pitchClass];
				octave = this.calculateOctave(pitchClass, octave, note);
				note_keys.push([note, octave].join('/'));
			}

			return note_keys;
		},
		// returns an array of objects containing each key and accidental
		_getAccidentalsOf: function(noteKeys) {
			var keySignature = this.keySignature;
			var accidentals = [];
			var accidental, 
				note, 
				note_spelling,
				natural_note, 
				natural_found_idx,
				is_doubled;

			for(var i = 0, len = noteKeys.length; i < len; i++) {
				// skip to next iteration is for the case that the
				// note has already been assigned a natural because
				// the same note name appears twice (i.e. is doubled).
				if(accidentals[i]) {
					continue;
				}

				note = noteKeys[i];
				note_spelling = note.replace(/\/\d$/, '');
				accidental = note_spelling.substr(1); // get default accidental
				natural_note = note.replace(accidental + "\/", '/');
				natural_found_idx = noteKeys.indexOf(natural_note);
				is_doubled = natural_found_idx !== -1 && i !== natural_found_idx;

				// check to see if this note is doubled - that is, the natrual version of
				// the note is also active at the same time, in which case it needs to be
				// distinguished with a natural accidental
				if(is_doubled) {
					accidentals[natural_found_idx] = 'n';
				} else {
					// otherwise check the key signature to determine the accidental
					if(keySignature.signatureContains(note_spelling)) {
						accidental = '';	
					} else if(keySignature.needsNatural(note_spelling)) {
						accidental = 'n';
					} 
				}

				accidentals[i] = accidental;
			}

			return accidentals;
		},
		// returns the octave for a note, taking into account 
		// the current note spelling 
		calculateOctave: function(pitchClass, octave, note) {
			var note_letter = note.charAt(0);
			if(pitchClass === 0 && note_letter === 'B') {
				return octave - 1;
			} else if(pitchClass === 11 && note_letter === 'C') {
				return octave + 1;
			}
			return octave;
		},
		// returns a list of keys and associated modifiers for constructing Vex.Flow stave notes
		_getNoteKeysAndModifiers: function() {
			var keys = this._getNoteKeys();
			var accidentals = this._getAccidentalsOf(keys);
			var allMidiKeys = this.chord.getNoteNumbers(); // for highlights across stave boundaries
			var midiKeys = this.chord.getNoteNumbers(this.clef);
			var modifiers = [];

			for(var i = 0, len = keys.length; i < len; i++) {
				if(accidentals[i]) {
					modifiers.push(this._makeAccidentalModifier(i, accidentals[i]));
				}
				if(this.highlights.enabled) {
					modifiers.push(this._makeHighlightModifier(i, midiKeys[i], allMidiKeys));
				}
			}

			return {keys: keys, modifiers: modifiers};
		},
		// returns a function that will add an accidental to a Vex.Flow stave note
		_makeAccidentalModifier: function(keyIndex, accidental) {
			return function(staveNote) {
				staveNote.addAccidental(keyIndex, new Vex.Flow.Accidental(accidental));
			};
		},
		_makeHighlightModifier: function(keyIndex, noteToHighlight, allNotes) {
			var analyze = new Analyze(this.keySignature, {
				highlightMode: this.highlights.mode
			});
			var color = analyze.ColorSpectacular(noteToHighlight, allNotes);
			var keyStyleOpts = {
				//shadowColor: color,
				//shadowBlur: 15,
				fillStyle: color,
				strokeStyle: color
			};

			return function(staveNote) {
				staveNote.setKeyStyle(keyIndex, keyStyleOpts);
			};
		},
		// returns a new Vex.Flow stave note
		_makeStaveNote: function(keys, modifiers) {
			modifiers = modifiers || [];

			var stave_note = new Vex.Flow.StaveNote({
				keys: keys,
				duration: 'w',
				clef: this.clef
			});

			for(var i = 0, len = modifiers.length; i < len; i++) {
				modifiers[i](stave_note);
			}

			return stave_note;
		}
	});

	return StaveNoteFactory;
});
