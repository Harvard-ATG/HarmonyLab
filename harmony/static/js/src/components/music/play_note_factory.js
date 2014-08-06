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
	 * PlayNoteFactory class.
	 *
	 * This class knows how to create Vex.Flow.StaveNote objects for play sheet.
	 *
	 * @constructor
	 * @param {object} settings
	 * @param {object} settings.chord 
	 * @param {object} settings.keySignature
	 * @param {object} settings.clef
	 * @param {object} settings.highlightConfig
	 * @param {object} settings.isBanked
	 * @return
	 */
	var PlayNoteFactory = function(settings) {
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
		if(!("isBanked" in this.settings)) {
			throw new Error("missing required settings.isBanked");
		}

		this.init();
	};

	_.extend(PlayNoteFactory.prototype, {
		/**
		 * Initializes the object.
		 *
		 * @param {object} config
		 * @return
		 */
		init: function(config) {
			/**
			 * Color for banked notes. 
			 * @type {string}
			 */
			this.bankedColor = 'rgb(0,0,128)'; // dark blue
			/**
			 * Indicates if chord is banked.
			 *
			 * @type {boolean}
			 */
			this.isBanked = this.settings.isBanked;

			this.chord = this.settings.chord;
			this.keySignature = this.settings.keySignature;
			this.clef = this.settings.clef;
			this.highlightConfig = this.settings.highlightConfig;

			_.bindAll(this, ['createModifiers']);

			this.staveNoteFactory = new StaveNoteFactory({
				chord: this.chord,
				keySignature: this.keySignature,
				clef: this.clef,
				highlightConfig: this.highlightConfig
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
			var modifiers = [];

			for(var i = 0, len = keys.length; i < len; i++) {
				if(accidentals[i]) {
					modifiers.push(this.staveNoteFactory.makeAccidentalModifier(i, accidentals[i]));
				}
				if(this.isBanked) {
					modifiers.push(this.makeBankedModifier(i));
				}
				if(this.highlightConfig.enabled) {
					modifiers.push(this.staveNoteFactory.makeHighlightModifier(i, clefMidiKeys[i], allMidiKeys));
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
		makeBankedModifier: function(keyIndex) {
			var keyStyle = {fillStyle:this.bankedColor, strokeStyle:this.bankedColor};
			return function(staveNote) {
				staveNote.setKeyStyle(keyIndex, keyStyle);
			};
		},
	});

	return PlayNoteFactory;
});
