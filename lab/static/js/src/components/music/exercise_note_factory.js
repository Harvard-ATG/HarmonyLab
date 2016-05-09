define([
	'lodash', 
	'vexflow',
	'app/utils/analyze',
	'./stave_note_factory'
], function(
	_, 
	Vex, 
	Analyze,
	StaveNoteFactory
) {
	"use strict";

	/**
	 * ExerciseNoteFactory class.
	 *
	 * This class knows how to create Vex.Flow.StaveNote objects for an exercise sheet.
	 *
	 * @constructor
	 * @param {object} settings
	 * @param {object} settings.clef
	 * @param {object} settings.chord 
	 * @param {object} settings.keySignature
	 * @param {object} settings.highlightConfig
	 * @return
	 */
	var ExerciseNoteFactory = function(settings) {
		this.settings = settings || {};

		_.each(['chord','keySignature','clef','highlightConfig'], function(prop) {
			if(prop in this.settings) {
				this[prop] = this.settings[prop];
			} else {
				throw new Error("missing required settings."+prop);
			}
		}, this);

		this.init();
	};

	_.extend(ExerciseNoteFactory.prototype, {
		/**
		 * Defines the colors used for highlighting notes.
		 *
		 * @public
		 * @type {object}
		 */
		noteColorMap: {
			notplayed: 'rgb(179,179,179)',
			correct: 'rgb(0,0,0)',
			incorrect: 'rgb(255,191,0)',
			complete: 'rgb(100,100,100)'
		},
		/**
		 * Initializes the object.
		 *
		 * @param {object} config
		 * @return
		 */
		init: function(config) {
			_.bindAll(this, ['createModifiers']);

			this.staveNoteFactory = new StaveNoteFactory({
				chord: this.chord,
				keySignature: this.keySignature,
				clef: this.clef,
				highlightConfig: this.highlightConfig,
				modifierCallback: this.createModifiers
			});
		},
		/**
		 * Creates one more Vex.Flow.StaveNote's.
		 *
		 * @public
		 * @return {array}
		 */
		createStaveNotes: function() {
			return this.staveNoteFactory.createStaveNotes();
		},
		/**
		 * Returns true if there are any stave notes to create, false otherwise.
		 *
		 * @public
		 * @return {boolean}
		 */
		hasStaveNotes: function() {
			return this.staveNoteFactory.hasStaveNotes();
		},
		/**
		 * Returns an array of modifer functions to modify a Vex.Flow.StaveNote.
		 *
		 * @return {array}
		 */
		createModifiers: function() {
			var keys = this.staveNoteFactory.getNoteKeys();
			var accidentals = this.staveNoteFactory.getAccidentalsOf(keys);
			var allMidiKeys = this.chord.getNoteNumbers(); // for highlightConfig across stave boundaries
			var clefMidiKeys = this.chord.getNoteNumbers(this.clef);
			var noteProps = this.chord.getNoteProps();
			var modifiers = [];
			var note, keyStyle;

			this.staveNoteFactory.resetHighlight();

			for(var i = 0, len = keys.length; i < len; i++) {
				note = clefMidiKeys[i];

				// Apply accidentals (if any)
				if(accidentals[i]) {
					modifiers.push(this.staveNoteFactory.makeAccidentalModifier(i, accidentals[i]));
				}

				// Set highlights in order of priority
				this.staveNoteFactory.highlightNote(i, {
					fillStyle:this.noteColorMap.notplayed, 
					strokeStyle:this.noteColorMap.notplayed
				}, 1);

				if(this.highlightConfig.enabled) {
					keyStyle = this.staveNoteFactory.getAnalysisHighlightOf(note, allMidiKeys);
					if(keyStyle !== false) {
						this.staveNoteFactory.highlightNote(i, keyStyle, 2);
					}
				}

				if(noteProps[note] && noteProps[note].hasOwnProperty('correctness')) {
					keyStyle = this.getCorrectnessColorStyle(noteProps[note].correctness);
					if(keyStyle !== false) {
						this.staveNoteFactory.highlightNote(i, keyStyle, 3); 
					}
				}

				keyStyle = this.staveNoteFactory.getHighlightOf(i);
				modifiers.push(this.staveNoteFactory.makeHighlightModifier(i, keyStyle));
			}

			return modifiers;
		},
		/**
		 * Returns the highlight color style for correct/incorrect notes.
		 *
		 * @param {boolean} isCorrect
		 * @return {object} object with color styles, or false if none to apply
		 */
		getCorrectnessColorStyle: function(isCorrect) {
			var colorStyle;

			if(isCorrect === true) {
				colorStyle = this.noteColorMap.correct;
			} else if(isCorrect === false) {
				colorStyle = this.noteColorMap.incorrect;
			} else {
				return false;
			}

			/* To do: if all notes of the chord are correct, apply
			 * colorStyle = this.noteColorMap.complete */

			return {fillStyle: colorStyle, strokeStyle: colorStyle};
		}
	});

	return ExerciseNoteFactory;
});
