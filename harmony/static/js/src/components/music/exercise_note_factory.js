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
	 * @param {object} settings.chord 
	 * @param {object} settings.keySignature
	 * @param {object} settings.clef
	 * @param {object} settings.highlightConfig
	 * @return
	 */
	var ExerciseNoteFactory = function(settings) {
		this.settings = settings || {};

		if(!("chord" in this.settings)) {
			throw new Error("missing required settings.chord");
		}
		if(!("keySignature" in this.settings)) {
			throw new Error("missing required settings.keySignature");
		}
		if(!("clef" in this.settings)) {
			throw new Error("missing required settings.clef");
		}
		if(!("highlightConfig" in this.settings)) {
			throw new Error("missing required settings.highlightConfig");
		}

		this.init();
	};

	_.extend(ExerciseNoteFactory.prototype, {
		/**
		 * Initializes the object.
		 *
		 * @param {object} config
		 * @return
		 */
		init: function(config) {
			this.noteColorMap = {
				notplayed: 'rgb(179,179,179)',
				correct: 'rgb(0,0,0)',
				incorrect: 'rgb(255,191,0)',
			};
			this.chord = this.settings.chord;
			this.keySignature = this.settings.keySignature;
			this.clef = this.settings.clef;
			this.highlightConfig = this.settings.highlightConfig;

			_.bindAll(this, ['createModifiers']);

			this.staveNoteFactory = new StaveNoteFactory({
				chord: this.chord,
				keySignature: this.keySignature,
				clef: this.clef,
				highlightConfig: this.highlightConfig,
				defaultNoteColor: this.noteColorMap.notplayed
			});
			this.staveNoteFactory.setModifierCallback(this.createModifiers);
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
			var modifier;
			var note;

			for(var i = 0, len = keys.length; i < len; i++) {
				note = clefMidiKeys[i];
				if(accidentals[i]) {
					modifiers.push(this.staveNoteFactory.makeAccidentalModifier(i, accidentals[i]));
				}
				if(this.highlightConfig.enabled) {
					modifiers.push(this.staveNoteFactory.makeHighlightModifier(i, note, allMidiKeys));
				}
				modifier = this.makeCorrectnessModifier(i, noteProps[note]);
				if(modifier) {
					modifiers.push(modifier);
				}
			}

			return modifiers;
		},
		/**
		 * Makes a modifier for banked keys.
		 *
		 * @protected
		 * @param {number} keyIndex
		 * @return {function} 
		 */
		makeCorrectnessModifier: function(keyIndex, noteProps) {
			var keyStyle = {}, colorStyle, correctness;
			noteProps = noteProps || {};
			correctness = noteProps.correctness;

			if(correctness === true) {
				colorStyle = this.noteColorMap.correct;
			} else if(correctness === false) {
				colorStyle = this.noteColorMap.incorrect;
			} else {
				return false;
			}

			keyStyle.fillStyle = colorStyle;
			keyStyle.strokeStyle = colorStyle;

			return function(staveNote) {
				staveNote.setKeyStyle(keyIndex, keyStyle);
			};
		},
	});

	return ExerciseNoteFactory;
});
