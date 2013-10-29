define([
	'lodash', 
	'vexflow',
	'app/util/analyze'
], function(
	_, 
	Vex, 
	Analyze
) {
	"use strict";

	/**
	 * Creates an instance of StaveNoteFactory.
	 *
	 * This object is responsible for knowing how to create stave notes that
	 * may be added to a Stave.
	 *
	 * In addition to the basic responsibility of creating notes with the
	 * correct accidental modifiers, it should also know how to highlight notes
	 * in different colors in order to draw attention to specific musical
	 * phenomena.
	 *
	 * @param {object} config
	 * @return
	 */
	var StaveNoteFactory = function(config) {
		this.init(config);
	};

	_.extend(StaveNoteFactory.prototype, {
		/**
		 * Initializes the object.
		 *
		 * @param {object} config
		 * @return
		 */
		init: function(config) {
			/**
			 * Configuration data passed to the constructor.
			 * @type {object}
			 */
			this.config = config;
			/**
			 * Color for banked notes. 
			 * @type {string}
			 */
			this.bankedColor = 'rgb(0,0,128)'; // dark blue
			/**
			 * Default note color.
			 * @type {string}
			 */
			this.defaultColor = 'rgb(0,0,0)'; // black

			this.initConfig();
		},
		/**
		 * Initializes the config.
		 *
		 * @return undefined
		 * @throws {Error} Will throw an error if any params are missing.
		 */
		initConfig: function() {
			var required = ['chord', 'isBanked', 'keySignature', 'clef', 'highlightsConfig'];
			_.each(required, function(propName) {
				if(this.config.hasOwnProperty(propName)) {
					this[propName] = this.config[propName];
				} else {
					throw new Error("missing required config property: "+propName);
				}
			}, this);
		},
		/**
		 * Creates one more Vex.Flow.StaveNote's.
		 *
		 * @public
		 * @return {array}
		 */
		createStaveNotes: function() {
			var note_struct = this._getNoteKeysAndModifiers();
			var stave_note = this._makeStaveNote(note_struct.keys, note_struct.modifiers);
			return [stave_note];
		},
		// 
		/**
		 * Returns true if there are any stave notes to create, false otherwise.
		 *
		 * @public
		 * @return {boolean}
		 */
		hasStaveNotes: function() {
			return this.chord.hasNotes(this.clef);
		},
		/**
		 * Returns a list of key names for this stave only ["note/octave", ...] 
		 *
		 * @protected
		 * @return {array}
		 */
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
		/**
		 * Returns an array of objects containing each key and accidental
		 *
		 * @protected
		 * @param {array} noteKeys
		 * @return {array}
		 */
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
		
		/**
		 * Returns the octave for a note, taking into account the current note spelling.
		 *
		 * @protected
		 * @param {number} pitchClass
		 * @param {number} octave
		 * @param {string} note
		 * @return {number}
		 */
		calculateOctave: function(pitchClass, octave, note) {
			var note_letter = note.charAt(0);
			if(pitchClass === 0 && note_letter === 'B') {
				return octave - 1;
			} else if(pitchClass === 11 && note_letter === 'C') {
				return octave + 1;
			}
			return octave;
		},
		/**
		 * Returns a list of keys and associated modifiers for constructing Vex.Flow stave notes.
		 *
		 * @protected
		 * @return {array}
		 */
		_getNoteKeysAndModifiers: function() {
			var keys = this._getNoteKeys();
			var accidentals = this._getAccidentalsOf(keys);
			var allMidiKeys = this.chord.getNoteNumbers(); // for highlightsConfig across stave boundaries
			var midiKeys = this.chord.getNoteNumbers(this.clef);
			var modifiers = [];

			for(var i = 0, len = keys.length; i < len; i++) {
				if(accidentals[i]) {
					modifiers.push(this._makeAccidentalModifier(i, accidentals[i]));
				}
				if(this.isBanked) {
					modifiers.push(this._makeBankedModifier(i));
				}
				if(this.highlightsConfig.enabled) {
					modifiers.push(this._makeHighlightModifier(i, midiKeys[i], allMidiKeys));
				}
			}

			return {keys: keys, modifiers: modifiers};
		},
		/**
		 * Returns a function that will add an accidental to a
		 * Vex.Flow.StaveNote. 
		 *
		 * @protected
		 * @param {number} keyIndex
		 * @param {string} accidental 
		 * @return {function}
		 */
		_makeAccidentalModifier: function(keyIndex, accidental) {
			return function(staveNote) {
				staveNote.addAccidental(keyIndex, new Vex.Flow.Accidental(accidental));
			};
		},
		/**
		 * Returns a function that will add a highlight color to a
		 * Vex.Flow.StaveNote.
		 *
		 * @protected
		 * @param {number} keyIndex
		 * @param {number} noteToHighlight MIDI note number.
		 * @param {array} allNotes Array of MIDI note numbers.
		 * @return {function}
		 */
		_makeHighlightModifier: function(keyIndex, noteToHighlight, allNotes) {
			var analyzer, color, keyStyleOpts;

			analyzer = new Analyze(this.keySignature, {
				highlightMode: this.highlightsConfig.mode
			});
			color = analyzer.ColorSpectacular(noteToHighlight, allNotes);
			if(!color) {
				color = (this.isBanked ? this.bankedColor : this.defaultColor);
			}
			keyStyleOpts = {
				//shadowColor: color,
				//shadowBlur: 15,
				fillStyle: color,
				strokeStyle: color
			};

			return function(staveNote) {
				staveNote.setKeyStyle(keyIndex, keyStyleOpts);
			};
		},
		/**
		 * Makes a modifier for banked keys.
		 *
		 * @protected
		 * @param {number} keyIndex
		 * @return {function} 
		 */
		_makeBankedModifier: function(keyIndex) {
			var keyStyle = {fillStyle:this.bankedColor, strokeStyle:this.bankedColor};
			return function(staveNote) {
				staveNote.setKeyStyle(keyIndex, keyStyle);
			};
		},
		/**
		 * Returns a new Vex.Flow.StaveNote with all modifiers added. 
		 *
		 * @protected
		 * @param {array} keys
		 * @param {array} modifiers
		 * @return {Vex.Flow.StaveNote}
		 */
		_makeStaveNote: function(keys, modifiers) {
			modifiers = modifiers || [];

			var QUARTER_NOTE = "q";
			var WHOLE_NOTE = "w";

			var stave_note = new Vex.Flow.StaveNote({
				keys: keys,
				duration: WHOLE_NOTE,
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
