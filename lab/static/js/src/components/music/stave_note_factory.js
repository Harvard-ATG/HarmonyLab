define([
	'lodash', 
	'vexflow',
	'app/utils/analyze'
], function(
	_, 
	Vex, 
	Analyze
) {
	"use strict";

	/**
	 * StaveNoteFactory.
	 *
	 * This class knows how to create Vex.Flow.StaveNote objects with modifiers.
	 *
	 * In addition to the basic responsibility of creating notes with the
	 * correct accidental modifiers, it can highlight notes in different 
	 * colors to draw attention to specific musical phenomena.
	 *
	 * @constructor
	 * @param {object} settings
	 * @param {object} settings.clef
	 * @param {object} settings.chord 
	 * @param {object} settings.keySignature
	 * @param {object} settings.highlightConfig
	 * @param {object} settings.modifierCallback
	 * @return
	 */
	var StaveNoteFactory = function(settings) {
		this.settings = settings || {};

		_.each(['chord','keySignature','clef','highlightConfig','modifierCallback'], function(prop) {
			if(prop in this.settings) {
				this[prop] = this.settings[prop];
			} else {
				throw new Error("missing required settings."+prop);
			}
		}, this);

		this.init();
	};

	_.extend(StaveNoteFactory.prototype, {
		/**
		 * Initializes the object.
		 *
		 * @return
		 */
		init: function() {
			this.defaultNoteColor = this.settings.defaultNoteColor || 'rgb(75,75,75)'; // dark gray
			this.highlightMap = {};
		},
		/**
		 * Creates one more Vex.Flow.StaveNote's.
		 *
		 * @public
		 * @return {array}
		 */
		createStaveNotes: function() {
			var stave_note = this._makeStaveNote(this.getNoteKeys(), this.getNoteModifiers());
			return [stave_note];
		},
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
		 * @return {array}
		 */
		getNoteKeys: function() {
			var note_nums = this.chord.getNoteNumbers(this.clef);
			var all_note_nums = this.chord.getNoteNumbers();
			var note_name, note_keys = [];

			for(var i = 0, len = note_nums.length; i < len; i++) {
				note_name = this.getNoteName(note_nums[i], all_note_nums);
				note_keys.push(note_name);
			}

			return note_keys;
		},
		/**
		 * Returns an array of functions that will modify a Vex.Flow.StaveNote
		 * that is passed as a parameter.
		 *
		 * @return {array}
		 */
		getNoteModifiers: function() {
			return this.modifierCallback.call(this);
		},
		/**
		 * Returns the correct spelling or note name of a given note in a
		 * collection of notes. 
		 *
		 * Note: this delegates to a utility function that handles the spelling
		 * logic, because in some cases, a note may not use the default
		 * spelling, but instead be re-spelled on the fly (snap spelling).
		 *
		 * @param {number} note
		 * @param {array} notes
		 * @return {string} the note name or spelling
		 */
		getNoteName: function(note, notes) {
			var analyzer = this._makeAnalyzer();
			return analyzer.getNoteName(note, notes);
		},
		/**
		 * Returns an array of objects containing each key and accidental
		 *
		 * @protected
		 * @param {array} noteKeys
		 * @return {array}
		 */
		getAccidentalsOf: function(noteKeys) {
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
		 * Returns the analysis color for a given note.
		 *
		 * @return {object} An object containg keyStyle options 
		 */
		getAnalysisHighlightOf: function(noteNumber, chordNoteNumbers) {
			var keyStyleOpts = {};
			var analyzer = this._makeAnalyzer({highlightMode: this.highlightConfig.mode});
			var color = analyzer.ColorSpectacular(noteNumber, chordNoteNumbers);
			if(!color) {
				return false;
			}

			keyStyleOpts = {
				//shadowColor: color,
				//shadowBlur: 15,
				fillStyle: color,
				strokeStyle: color
			};

			return keyStyleOpts;
		},
		/**
		 * Resets the note highlight mappings.
		 *
		 * @return this
		 */
		resetHighlight: function() {
			this.highlightMap = {};
			return this;
		},
		/**
		 * Highlights a note in a Vex.Flow.StaveNote, given by key index, 
		 * and applies a key style. Since there may be several styles 
		 * applied to a single key, each highlight should have a priority.
		 * If all keys have a priority, then the order is undefined.
		 *
		 * Note: in order to retrieve the computed highlight, call 
		 * makeHighlightModifier() once for each keyIndex.
		 *
		 * @return this
		 */
		highlightNote: function(keyIndex, keyStyleOpts, priority) {
			if(typeof priority === 'undefined') {
				priority = 0;
			}
			if(typeof keyStyleOpts === 'undefined') {
				keyStyleOpts = {
					//shadowColor: color,
					//shadowBlur: color,
					//fillStyle: color,
					//strokeStyle: color
				};
			}

			if(!this.highlightMap.hasOwnProperty(keyIndex)) {
				this.highlightMap[keyIndex] = [];
			}

			this.highlightMap[keyIndex].push({
				priority: priority,
				keyStyle: keyStyleOpts
			});

			return this;
		},
		/**
		 * Returns the highlight for a given key with the highest priority.
		 *
		 * @return {object} An object containing key style options.
		 */
		getHighlightOf: function(keyIndex) {
			var hmap = this.highlightMap; 
			var defaultKeyStyle = {
				fillStyle: this.defaultNoteColor, 
				strokeStyle: this.defaultNoteColor
			};
			var styles = [];

			if(hmap[keyIndex]) {
				if(hmap[keyIndex].length == 1) {
					return hmap[keyIndex][0].keyStyle;
				}
				styles = hmap[keyIndex].slice(0);
				styles.sort(this.comparePriority);
				return styles[0].keyStyle;
			}

			return defaultKeyStyle;
		},
		/**
		 * Compares two objects by the value of their priority attribute.
		 *
		 * @return -1 if a>b, 0 if a==b, or 1 if a<b
		 */
		comparePriority: function(a, b) {
			if(a.priority > b.priority) {
				return -1;
			} else if(a.priority == b.priority) {
				return 0;
			}
			return 1;
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
		 * Returns a function that will add an accidental to a
		 * Vex.Flow.StaveNote. 
		 *
		 * @protected
		 * @param {number} keyIndex
		 * @param {string} accidental 
		 * @return {function}
		 */
		makeAccidentalModifier: function(keyIndex, accidental) {
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
		 * @param {object} keyStyle Object of keyStyleOptions
		 * @return {function}
		 */
		makeHighlightModifier: function(keyIndex, keyStyle) {
			return function(staveNote) {
				staveNote.setKeyStyle(keyIndex, keyStyle);
			};
		},
		/**
		 * Returns a new instance of Analyze using the current key signature.
		 *
		 * Used by the highlight method to highlight certain notes and also by
		 * the method that looks up the note name.
		 *
		 * @param {object} options
		 * @return {object}
		 */
		_makeAnalyzer: function(options) {
			return new Analyze(this.keySignature, options);
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

			var QUARTER_NOTE = "q"; // shorthand for '4' as VexFlow duration
			var HALF_NOTE = "h"; // shorthand for '2' as VexFlow duration
			var WHOLE_NOTE = "w"; // shorthand for '1' as VexFlow duration

			var stave_note = new Vex.Flow.StaveNote({
				keys: keys,
				/**
				 * Duration must equal a full bar as defined
				 * in Vex.Flow.TIME4_4 (called in stave.js and
				 * defined in vexflow.js)
				 */
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
