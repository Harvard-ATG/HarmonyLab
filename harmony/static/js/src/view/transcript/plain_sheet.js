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

	var CHORD_BANK_SIZE = Config.get('general.chordBank.displaySize');

	// Plain Sheet Music Notation.
	// 
	// This object knows how to display plain sheet music notation.
	//
	var PlainSheet = function(config) {
		this.init(config);
	};

	_.extend(PlainSheet.prototype, {
		// global event bus 
		eventBus: eventBus, 
		highlightsConfig: {
			enabled: false,
			mode: {}
		},
		analyzeConfig: {
			enabled: false,
			tempo: false,
			mode: {
				'note_names': true,
				'helmholtz': false,
				'scale_degrees': true,
				'solfege': false
			}
		},
		init: function(config) {
			this.config = config;
			this.initConfig();
			this.initRenderer();
			this.initStaves();
			this.initListeners();
		},
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
		initRenderer: function() {
			var CANVAS = Vex.Flow.Renderer.Backends.CANVAS;

			this.el = $('<canvas></canvas>');
			this.el[0].width = this.getWidth();
			this.el[0].height = this.getHeight();

			this.vexRenderer = new Vex.Flow.Renderer(this.el[0], CANVAS);

			this.transcript.el.append(this.el);
		},
		initStaves: function() {
			this.updateStaves();
		},
		initListeners: function() {
			_.bindAll(this, [
				'render',
				'onHighlightChange',
				'onAnalyzeChange',
				'onMetronomeChange',
				'onChordsBank'
			]);

			this.keySignature.bind('change', this.render);
			this.chords.bind('change', this.render);
			this.chords.bind('bank', this.onChordsBank);
			this.eventBus.bind("notation:highlight", this.onHighlightChange);
			this.eventBus.bind("notation:analyze", this.onAnalyzeChange);
			this.eventBus.bind("metronome", this.onMetronomeChange);
		},
		clear: function() {
			this.vexRenderer.getContext().clear();
		},
		render: function() { 
			this.clear();
			this.renderStaves();
			return this;
		},
		renderStaves: function() {
			var i, len, stave, _staves = this.staves;
			for(i = 0, len = _staves.length; i < len; i++) {
				stave = _staves[i];
				stave.render();
			}
		},
		resetStaves: function() {
			this.staves = [];
			return this;
		},
		addStaves: function(staves) {
			this.staves = this.staves.concat(staves);
			return this;
		},
		updateStaves: function() {
			var chord, treble, bass;
			var limit = CHORD_BANK_SIZE;
			var items = this.chords.items({limit: limit, reverse: true});
			var staves = [];
			var index = 0;
			var count = items.length;
			var position = {index:index,count:count,maxCount:limit};

			// the first stave bar is a special case: it's reserved to show the
			// clef and key signature and nothing else
			treble = this.createDisplayStave('treble', _.clone(position));
			bass = this.createDisplayStave('bass', _.clone(position));
			position.index += 1;
			treble.connect(bass);
			staves.push(treble);

			// now add the staves for showing the notes
			for(var i = 0, len = items.length; i < len; i++) {
				chord = items[i];
				treble = this.createNoteStave('treble', _.clone(position), chord);
				bass = this.createNoteStave('bass', _.clone(position), chord);
				position.index += 1;
				treble.connect(bass);
				staves.push(treble);
			}

			this.resetStaves();
			this.addStaves(staves);

			return this;
		},
		createDisplayStave: function(clef, position) {
			var stave = new Stave(clef, position);

			stave.setRenderer(this.vexRenderer);
			stave.setKeySignature(this.keySignature);
			stave.setNotater(StaveNotater.create(clef, {
				stave: stave,
				keySignature: this.keySignature,
				analyzeConfig: this.analyzeConfig
			}));
			stave.enableDisplayOptions(['clef', 'keySignature', 'staveConnector']);
			stave.setMaxWidth(this.getWidth());
			stave.updatePosition();

			return stave;
		},
		createNoteStave: function(clef, position, chord) {
			var stave = new Stave(clef, position);

			stave.setRenderer(this.vexRenderer);
			stave.setKeySignature(this.keySignature);
			stave.setNoteFactory(new StaveNoteFactory({
				clef: clef,
				chord: chord,
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

			return stave;
		},
		getWidth: function() {
			return this.transcript.getWidth();
		},
		getHeight: function() {
			return this.transcript.getHeight();
		},
		getBottomStaveX: function() {
			if(this.staves.length > 0) {
				return this.staves[0].getStartX();
			}
			return 0;
		},
		getBottomStaveY: function() {
			if(this.staves.length > 0) {
				return this.staves[0].getConnected().getBottomY();
			}
			return 0;
		},
		getTopStaveY: function() {
			if(this.staves.length > 0) {
				return this.staves[0].getTopY();
			}
			return 0;
		},
		updateSettings: function(prop, setting) {
			switch(setting.key) {
				case "enabled":
					this[prop].enabled = setting.value; 
					break;
				case "mode":
					_.assign(this[prop].mode, setting.value);	
					break;
				default:
					throw new Error("Invalid key");
			}
			return this;
		},
		onChordsBank: function() {
			this.updateStaves();
			this.render();
		},
		onHighlightChange: function(settings) {
			this.updateSettings('highlightsConfig', settings);
			this.render();
		},
		onAnalyzeChange: function(settings) {
			this.updateSettings('analyzeConfig', settings);
			this.render();
		},
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
