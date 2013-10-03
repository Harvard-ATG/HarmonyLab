/* global define: false */
define([
	'jquery',
	'lodash', 
	'vexflow',
	'app/model/event_bus',
	'app/view/transcript/stave',
	'app/view/transcript/stave_notater',
	'app/view/transcript/stave_note_factory'
], function(
	$,
	_, 
	Vex, 
	eventBus, 
	Stave, 
	StaveNotater,
	StaveNoteFactory
) {
	"use strict";

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
		// configures highlighting of notes
		highlights: {
			enabled: false,
			mode: {
				roots: false, 
				doubles: false, 
				tritones: false, 
				octaves: false
			}
		},
		// configures analysis of notes
		analyze: {
			enabled: false,
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
			_.bindAll(this, ['render', 'onHighlightChange', 'onAnalyzeChange', 'onMetronomeChange', 'onChordsBank']);

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
			this.renderAnnotations();
			return this;
		},
		renderStaves: function() {
			var i, len, stave, _staves = this.staves;
			var max_width = this.getWidth();
			for(i = 0, len = _staves.length; i < len; i++) {
				stave = _staves[i];

				stave.setMaxX(max_width);
				if(i === len - 1) {
					stave.fitToWidth();
				}
	
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
			var items = this.chords.items({limit: 3, reverse: true});
			var staves = [];
			var index = 0;

			// the first stave bar is a special case: it's reserved to show the
			// clef and key signature and nothing else
			treble = this.createDisplayStave('treble', index);
			bass = this.createDisplayStave('bass', index);
			index = index + 1;
			treble.connect(bass);
			staves.push(treble);

			// now add the staves for showing the notes
			for(var i = 0, len = items.length; i < len; i++) {
				chord = items[i];
				treble = this.createNoteStave('treble', index, chord);
				bass = this.createNoteStave('bass', index, chord);
				index = index + 1;
				treble.connect(bass);
				staves.push(treble);
			}

			this.resetStaves();
			this.addStaves(staves);

			return this;
		},
		createDisplayStave: function(clef, index) {
			var stave = new Stave(clef, index);
			stave.setRenderer(this.vexRenderer);
			stave.setKeySignature(this.keySignature);
			stave.enableDisplayOptions(['clef', 'keySignature', 'staveConnector']);
			return stave;
		},
		createNoteStave: function(clef, index, chord) {
			var stave = new Stave(clef, index);

			stave.setRenderer(this.vexRenderer);
			stave.setKeySignature(this.keySignature);
			stave.setNoteFactory(new StaveNoteFactory({
				clef: clef,
				chord: chord,
				keySignature: this.keySignature,
				highlights: this.highlights
			}));
			stave.setNotater(StaveNotater.create(clef, {
				stave: stave,
				chord: chord,
				keySignature: this.keySignature,
				analyze: this.analyze
			}));

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
		renderAnnotations: function() {
			var ctx = this.vexRenderer.getContext();
			var key = this.keySignature.getKeyShortName() + ':';
			var font = "14px serif";
			var x = this.getBottomStaveX();

			ctx.save();
			ctx.font = font;
			if(this.tempo) {
				var note_symbol = "\u2669";
				ctx.fillText("("+note_symbol+" = "+this.tempo+")", x, this.getTopStaveY() - 15);
			}
			ctx.fillText(this.convertSymbols(key), x, this.getBottomStaveY());
			ctx.restore();

			return this;
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
		convertSymbols: function(text) {
			var rules = [
				[/&dim;/g,"\u00b0"], //	diminished and half-diminished signs
				[/&hdim;/g,"\u2300"],
				[/&3;/g,"\u00b3"],//	figured bass
				[/&6;/g,"\u2076"],
				[/&7;/g,"\u2077"],
				[/&42;/g,"\u2074\u2082"],
				[/&43;/g,"\u2074\u2083"],
				[/&52;/g,"\u2075\u2082"],
				[/&53;/g,"\u2075\u2083"],
				[/&54;/g,"\u2075\u2084"],
				[/&64;/g,"\u2076\u2084"],
				[/&65;/g,"\u2076\u2085"],
				[/&73;/g,"\u2077\u2083"],
				[/&75;/g,"\u2077\u2085"],
				//[/&d5;/g,"5\u0337"],			figured bass chord of the false fifth
				//[/&d7;/g,"7\u0337"],			figured bass diminished seveth
				[/&b;/g,"\u266d"],		//	flat
				//[/&#;/g,"\u266f"],			sharp
				//[/&n;/g,"\u266e"],			natural
				//[/&bb;/g,"\ud834\udd2b"],		double flat
				//[/&##;/g,"\ud834\udd2A"],		double sharp
				["&#x131;","\u0131"],		//	i for fake "Fi" ligature
				[/([cdefgab])b([ :])/i,"$1\u266d$2"],	//	necessary for key labels but could be changed
				[/b([0-9])/,"\u266d$1"],			//	necessary for figured bass and scale degrees but could be changed
				[/^([cdefgab])n /i,"$1\u266e "],
				[/^n([0-9])$/i,"\u266e$1"],
				[/^n$/i,"\u266e"],
				['&nbsp;', '']
			];
			var i, rule, len;

			for(i = 0, len = rules.length; i < len; i++) {
				rule = rules[i];
				text = text.replace(rule[0], rule[1]);
			}

			return text;
		},
		onChordsBank: function() {
			this.updateStaves();
			this.render();
		},
		onHighlightChange: function(settings) {
			this.updateSettings('highlights', settings);
			this.render();
		},
		onAnalyzeChange: function(settings) {
			this.updateSettings('analyze', settings);
			this.render();
		},
		onMetronomeChange: function(metronome) {
			if(metronome.isPlaying()) {
				this.tempo = metronome.getTempo();
			} else {
				this.tempo = false;
			}
			this.render();
		}
	});

	return PlainSheet;
});
