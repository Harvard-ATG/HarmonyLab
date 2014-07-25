/* global define: false */
define([
	'jquery',
	'jquery-ui',
	'lodash', 
	'vexflow',
	'app/config',
	'app/components/component',
	'./stave',
	'./stave_notater',
	'./stave_note_factory'
], function(
	$,
	$UI,
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
			'onChordsUpdate',
			'updateExerciseStatus'
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

			this.el = $('canvas#staff');
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
			this.renderExerciseText();

			return this;
		},
		/**
		 * Renders intro or review text for the exercise.
		 *
		 * @return this
		 */
		renderExerciseText: function() {
			var exc = this.exerciseContext;
			var definition = exc.getDefinition();
			var $dialog = $("#exerciseDialog");
			var dialog_config = {
				modal: true,
				buttons: {
					Ok: function() {
						$(this).dialog("close");
					}
				}
			};

			switch(exc.state) {
				case exc.STATE.READY:
					if(exc.definition.hasIntro()) {
						$dialog.html(exc.definition.getIntro());
						$dialog.dialog(dialog_config);
					}
					break;
				case exc.STATE.CORRECT:
					if(exc.definition.hasReview()) {
						$dialog.html(exc.definition.getReview());
						$dialog.dialog(dialog_config);
					}
					break;
				default:
					break;
			}

			return this;
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
			var stave_notater = this.createStaveNotater(clef, {
				stave: stave,
				keySignature: this.keySignature,
				analyzeConfig: this.getAnalyzeConfig()
			});

			stave.setRenderer(this.vexRenderer);
			stave.setKeySignature(this.keySignature);
			stave.setNotater(stave_notater);
			stave.setMaxWidth(this.getWidth());
			stave.updatePosition();
			stave.bind("notated", this.updateExerciseStatus);

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
			stave.setNotater(this.createStaveNotater(clef, {
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
		 * Creates an instance of StaveNotater.
		 *
		 * @param {string} clef The clef, treble|bass, to create.
		 * @param {object} config The config for the StaveNotater.
		 * @return {object}
		 */
		createStaveNotater: function(clef, config) {
			return StaveNotater.create(clef, config);
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
		 * Returns the chords for display.
		 *
		 * @return undefined
		 */
		getDisplayChords: function() {
			return this.exerciseContext.getDisplayChords();
		},
		/**
		 * Returns the input chords.
		 *
		 * @return undefined
		 */
		getInputChords: function() {
			return this.exerciseContext.getInputChords();
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
		/**
		 * Updates the exercise status.
		 *
		 * @return undefined
		 */
		updateExerciseStatus: function(notater) {
			var can_notate = (notater.clef === StaveNotater.BASS && notater.stave.isFirstBar());
			if(!can_notate) {
				return;
			}
			var ctx = notater.getContext()
			var x = notater.getX();
			var y = notater.getY() + 45;
			var exc = this.exerciseContext;
			var state = exc.state;
			var label = 'Exercise status: '; 
			var text_width = 0;
			var content = '';
			var status_map = {};
			var font_size = "14px";

			status_map[exc.STATE.INCORRECT] = {color:"#990000",content:"\uf12a"};
			status_map[exc.STATE.CORRECT] = {color:"#4C9900",content:"\uf122"};
			status_map[exc.STATE.WAITING] = {color:"#999900",content:""};
			status_map[exc.STATE.READY] = {color:"#000000",content:""};

			// status indicator label
			ctx.save();
			ctx.font = notater.getTextFont(font_size);
			ctx.fillStyle = "#000000";
			ctx.fillText(label, x, y);
			text_width = ctx.measureText(label).width;
			ctx.restore();

			// status indicator text
			ctx.save();
			ctx.font = notater.getTextFont(font_size);
			content = state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();
			ctx.fillStyle = status_map[state].color;
			ctx.fillText(content, x + text_width + 5, y);
			text_width += ctx.measureText(content).width + 5;
			ctx.restore();

			// status indicator icon
			ctx.save();
			ctx.font = notater.getIconFont(font_size);
			ctx.fillStyle = status_map[state].color;
			content = status_map[state].content;
			ctx.fillText(content, x + text_width + 5, y);
			ctx.restore();
		}
	});

	return ExerciseSheetComponent;
});
