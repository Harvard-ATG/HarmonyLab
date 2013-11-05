/* global define: false */
define([
	'jquery',
	'lodash', 
	'vexflow',
	'app/config',
	'app/model/event_bus',
	'app/view/transcript/stave',
	'app/view/transcript/stave_notater',
	'app/view/transcript/stave_note_factory',
	'app/util'
], function(
	$,
	_, 
	Vex, 
	Config,
	eventBus, 
	Stave, 
	StaveNotater,
	StaveNoteFactory,
	util
) {
	"use strict";

	/**
	 * Defines the size of the chord bank (how many chords to display on
	 * screen).
	 * @type {number}
	 */
	var CHORD_BANK_SIZE = Config.get('general.chordBank.displaySize');
	/**
	 * This is a map of analysis modes to booleans indicating whether the mode
	 * is enabled or disabled by default.
	 * @type {object}
	 */
	var ANALYSIS_SETTINGS = Config.get('general.analysisSettings');

	/**
	 * Creates an instance of PlainSheet.
	 *
	 * This object is responsible for knowing how to display plain sheet music
	 * notation with the notes that have sounded (saved in the chord bank) and
	 * are currently sounding via MIDI input or some other means. So this object
	 * should know how to display the grand staff and configure it for analysis,
	 * highlights, etc.
	 *
	 * @constructor
	 * @param {object} config
	 */
	var PlainSheet = function(config) {
		this.init(config);
	};

	_.extend(PlainSheet.prototype, {
		/**
		 * Global event bus for distributing app-wide events
		 * @type {object}
		 */
		eventBus: eventBus, 
		/**
		 * Configuration for highlighting notes on the sheet music.
		 * @type {object}
		 */
		highlightsConfig: {
			enabled: false,
			mode: {}
		},
		/**
		 * Configuration for analyzing notes on the sheet music.
		 * @type {object}
		 */
		analyzeConfig: {
			enabled: ANALYSIS_SETTINGS.enabled,
			mode: ANALYSIS_SETTINGS.mode,
			tempo: false,
		},
		/**
		 * Initializes the sheet.
		 *
		 * @param {object} config
		 * @return undefined
		 */
		init: function(config) {
			this.config = config;
			this.initConfig();
			this.initRenderer();
			this.initStaves();
			this.initListeners();
		},
		/**
		 * Initializes the configuration and checks for missing/required
		 * parameters.
		 *
		 * @return undefined
		 * @throws {Error} Will throw an error if it is missing any required
		 * params.
		 */
		initConfig: function() {
			var required = ['transcript', 'chords', 'keySignature'];
			_.each(required, function(propName) {
				if(this.config.hasOwnProperty(propName)) {
					this[propName] = this.config[propName];
				} else {
					throw new Error("missing required config property: "+propName);
				}
			}, this);
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

			this.transcript.el.append(this.el);
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
			_.bindAll(this, [
				'render',
				'onHighlightChange',
				'onAnalyzeChange',
				'onMetronomeChange',
				'onChordsUpdate'
			]);

			this.keySignature.bind('change', this.render);
			this.chords.bind('change', this.render);
			this.chords.bind('clear', this.onChordsUpdate);
			this.chords.bind('bank', this.onChordsUpdate);
			this.eventBus.bind("notation:highlight", this.onHighlightChange);
			this.eventBus.bind("notation:analyze", this.onAnalyzeChange);
			this.eventBus.bind("metronome", this.onMetronomeChange);
		},
		/**
		 * Clears the sheet.
		 *
		 * @return undefined
		 */
		clear: function() {
			this.vexRenderer.getContext().clear();
		},
		/**
		 * Renders the grand staff and everything on it.
		 *
		 * @return this
		 */
		render: function() { 
			this.clear();
			this.renderStaves();
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
			var items = this.chords.items({limit: limit, reverse: true});
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
				analyzeConfig: this.analyzeConfig
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
				highlightsConfig: this.highlightsConfig
			}));
			stave.setNotater(StaveNotater.create(clef, {
				stave: stave,
				chord: chord,
				keySignature: this.keySignature,
				analyzeConfig: this.analyzeConfig
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
			return this.transcript.getWidth();
		},
		/**
		 * Returns the height of the sheet.
		 *
		 * @return {number}
		 */
		getHeight: function() {
			return this.transcript.getHeight();
		},
		/**
		 * Updates settings.
		 *
		 * @param {string} prop
		 * @param {object} setting
		 * @return this
		 */
		updateSettings: function(prop, setting) {
			var mode = _.cloneDeep(this[prop].mode);
			switch(setting.key) {
				case "enabled":
					this[prop].enabled = setting.value; 
					break;
				case "mode":
					_.assign(mode, setting.value);	
					this[prop].mode = mode;
					break;
				default:
					throw new Error("Invalid key");
			}
			return this;
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
		 * Handles a change to the highlight settings.
		 *
		 * @param {object} settings
		 * @return undefined
		 */
		onHighlightChange: function(settings) {
			this.updateSettings('highlightsConfig', settings);
			this.render();
		},
		/**
		 * Handles a change to the analyze settings.
		 *
		 * @param {object} settings
		 * @return undefined
		 */
		onAnalyzeChange: function(settings) {
			this.updateSettings('analyzeConfig', settings);
			this.render();
		},
		/**
		 * Handles a change to the metronome settings.
		 *
		 * @param {object} settings
		 * @return undefined
		 */
		onMetronomeChange: function(metronome) {
			if(metronome.isPlaying()) {
				this.analyzeConfig.tempo = metronome.getTempo();
			} else {
				this.analyzeConfig.tempo = false;
			}
			this.render();
		}
	});

	return PlainSheet;
});
