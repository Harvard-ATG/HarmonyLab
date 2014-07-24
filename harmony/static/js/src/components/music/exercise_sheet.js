/* global define: false */
define([
	'jquery',
	'lodash', 
	'vexflow',
	'app/config',
	'app/components/component',
	'./stave',
	'./stave_notater',
	'./stave_note_factory'
], function(
	$,
	_, 
	Vex, 
	Config,
	Component,
	Stave, 
	StaveNotater,
	StaveNoteFactory
) {
	"use strict";

	/**
	 * Defines the size of the chord bank (how many chords to display on
	 * screen).
	 * @type {number}
	 */
	var CHORD_BANK_SIZE = Config.get('general.chordBank.displaySize');

	/**
	 * ExerciseSheetComponent
	 *
	 * This object is responsible for knowing how to display plain sheet music
	 * notation with the notes that have sounded (saved in the chord bank) and
	 * are currently sounding via MIDI input or some other means. So this object
	 * should know how to display the grand staff and configure it for analysis,
	 * highlight, etc.
	 *
	 * @constructor
	 * @param {object} settings
	 * @param {ChordBank} settings.chords Required property.
	 * @param {KeySignature} settings.keySignature Required property.
	 */
	var ExerciseSheetComponent = function(settings) {
		this.settings = settings || {};

		if("exerciseContext" in this.settings) {
			this.exerciseContext = this.settings.exerciseContext;
		} else {
			throw new Error("missing settings.exerciseContext");
		}

		if("keySignature" in this.settings) {
			this.keySignature = this.settings.keySignature;
		} else {
			throw new Error("missing settings.keySignature");
		}

		_.bindAll(this, [
			'render',
			'onChordsUpdate'
		]);
	};

	ExerciseSheetComponent.prototype = new Component();

	_.extend(ExerciseSheetComponent.prototype, {
		/**
		 * Initializes the sheet.
		 *
		 * @param {object} config
		 * @return undefined
		 */
		initComponent: function() {
			this.initRenderer();
			this.initStaves();
			this.initListeners();
		},
		/**
		 * Initializes the canvas renderer and dom element.
		 *
		 * @return
		 */
		initRenderer: function() {
			var CANVAS = Vex.Flow.Renderer.Backends.CANVAS;

			this.el = $('<canvas></canvas>');
			this.el[0].width = this.getWidth();
			this.el[0].height = this.getHeight();

			this.vexRenderer = new Vex.Flow.Renderer(this.el[0], CANVAS);

			this.parentComponent.el.append(this.el);
		},
		/**
		 * Initializes the staves that together will form the grand staff.
		 *
		 * @return undefined
		 */
		initStaves: function() {
			this.updateStaves();
		},
		/**
		 * Initializes event listeners.
		 *
		 * @return undefined
		 */
		initListeners: function() {
			this.parentComponent.bind('change', this.render);
			this.keySignature.bind('change', this.render);
			this.getInputChords().bind('change', this.render);
			this.getInputChords().bind('clear', this.onChordsUpdate);
		},
		/**
		 * Renders the grand staff and everything on it.
		 *
		 * @return this
		 */
		render: function() { 
			this.clear();
			this.renderStaves();
			this.renderExerciseStatus();
			return this;
		},
		/**
		 * Renders the status of the exercise.
		 *
		 * @return undefined
		 */
		renderExerciseStatus: function() {
			var ctx = this.vexRenderer.getContext()
			var exc = this.exerciseContext;
			var state = exc.state;
			var color_map = {};
			color_map[exc.STATE.INCORRECT] = "#990000";
			color_map[exc.STATE.CORRECT] = "#4C9900";
			color_map[exc.STATE.WAITING] = "#999900";
			color_map[exc.STATE.READY] = "#000000";

			ctx.save();
			ctx.font = "14px Georgia, serif";
			ctx.fillStyle = color_map[state];
			ctx.fillText(state.toUpperCase(), this.getWidth() - 100, this.getHeight() - 25);
			ctx.restore();
		},
		/**
		 * Clears the sheet.
		 *
		 * @return this
		 */
		clear: function() {
			this.vexRenderer.getContext().clear();
			return this;
		},
		/**
		 * Renders each individual stave.
		 *
		 * @return this
		 */
		renderStaves: function() {
			var i, len, stave, _staves = this.staves;
			for(i = 0, len = _staves.length; i < len; i++) {
				stave = _staves[i];
				stave.render();
			}
			return this;
		},
		/**
		 * Resets the staves.
		 *
		 * @return this
		 */
		resetStaves: function() {
			this.staves = [];
			return this;
		},
		/**
		 * Adds staves.
		 *
		 * @param {array} staves
		 * @return this
		 */
		addStaves: function(staves) {
			this.staves = this.staves.concat(staves);
			return this;
		},
		/**
		 * Updates and configures the staves.
		 *
		 * @return this
		 */
		updateStaves: function() {
			var chord, treble, bass;
			var limit = CHORD_BANK_SIZE;
			var items = this.getDisplayChords().items({limit: limit, reverse: true});
			var staves = [];
			var index = 0;
			var count = items.length;
			var position = {index:index,count:count,maxCount:limit};
			var isBanked;

			// the first stave bar is a special case: it's reserved to show the
			// clef and key signature and nothing else
			treble = this.createDisplayStave('treble', _.clone(position));
			bass = this.createDisplayStave('bass', _.clone(position));
			position.index += 1;
			treble.connect(bass);
			staves.push(treble);

			// now add the staves for showing the notes
			for(var i = 0, len = items.length; i < len; i++) {
				chord = items[i].chord;
				isBanked = items[i].isBanked;
				treble = this.createNoteStave('treble', _.clone(position), chord, isBanked);
				bass = this.createNoteStave('bass', _.clone(position), chord, isBanked);
				position.index += 1;
				treble.connect(bass);
				staves.push(treble);
			}

			this.resetStaves();
			this.addStaves(staves);

			return this;
		},
		/**
		 * Creates a stave to display the clef, key signature, etc.
		 *
		 * @param {string} clef
		 * @param {object} position
		 * @return {Stave}
		 */
		createDisplayStave: function(clef, position) {
			var stave = new Stave(clef, position);

			stave.setRenderer(this.vexRenderer);
			stave.setKeySignature(this.keySignature);
			stave.setNotater(StaveNotater.create(clef, {
				stave: stave,
				keySignature: this.keySignature,
				analyzeConfig: this.getAnalyzeConfig()
			}));
			stave.setMaxWidth(this.getWidth());
			stave.updatePosition();

			return stave;
		},
		/**
		 * Creates a stave to display notes.
		 *
		 * @param {string} clef
		 * @param {object} position
		 * @param {Chord} chord
		 * @return {Stave}
		 */
		createNoteStave: function(clef, position, chord, isBanked) {
			var stave = new Stave(clef, position);

			stave.setRenderer(this.vexRenderer);
			stave.setKeySignature(this.keySignature);
			stave.setNoteFactory(new StaveNoteFactory({
				clef: clef,
				chord: chord,
				isBanked: isBanked,
				keySignature: this.keySignature,
				highlightConfig: this.getHighlightConfig()
			}));
			stave.setNotater(StaveNotater.create(clef, {
				stave: stave,
				chord: chord,
				keySignature: this.keySignature,
				analyzeConfig: this.getAnalyzeConfig()
			}));
			stave.setMaxWidth(this.getWidth());
			stave.updatePosition();
			stave.setBanked(isBanked);

			return stave;
		},
		/**
		 * Returns the width of the sheet.
		 *
		 * @return {number}
		 */
		getWidth: function() {
			return this.parentComponent.getWidth();
		},
		/**
		 * Returns the height of the sheet.
		 *
		 * @return {number}
		 */
		getHeight: function() {
			return this.parentComponent.getHeight();
		},
		/**
		 * Returns the analysis settings of the sheet.
		 *
		 * @return {object}
		 */
		getAnalyzeConfig: function() {
			return this.parentComponent.analyzeConfig;
		},
		/**
		 * Returns the highlight settings of the sheet.
		 *
		 * @return {object}
		 */
		getHighlightConfig: function() {
			return this.parentComponent.highlightConfig;
		},
		/**
		 * Handles a chord bank update.
		 *
		 * @return undefined
		 */
		onChordsUpdate: function() {
			this.updateStaves();
			this.render();
		},
		getDisplayChords: function() {
			return this.exerciseContext.getDisplayChords();
		},
		getInputChords: function() {
			return this.exerciseContext.getInputChords();
		},
	});

	return ExerciseSheetComponent;
});
