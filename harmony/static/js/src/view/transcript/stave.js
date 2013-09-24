/* global define: false */ 
define([
	'lodash', 
	'vexflow',
], function(_, Vex, StaveNotater) {
	"use strict";

	// Knows how to render and manipulate a staff/stave.
	var Stave = function(config) {
		this.init(config);
	};

	_.extend(Stave.prototype, {
		defaultWidth: 100,
		margin: 18,
		clefs: {
			'treble': { 'index': 1 },
			'bass':   { 'index': 2 }
		},
		// initialization
		init: function(config) {
			this.config = config;
			this.initConfig();

			this.clefConfig = this.clefs[this.clef];
			this.width = this.defaultWidth;
			this.minWidth = this.defaultWidth;
			this.maxWidth = this.defaultWidth;
			this.start_x = this.margin + (this.barIndex * this.defaultWidth);
			if(this.barIndex === 0) {
				this.width += 70;
			} else {
				this.start_x += 70;
			}
		},
		initConfig: function() {
			var required = [
				'clef', 
				'barIndex', 
				'barCount', 
				'staveNotater', 
				'vexRenderer', 
				'keySignature'
			];
			_.each(required, function(propName) {
				if(this.config.hasOwnProperty(propName)) {
					this[propName] = this.config[propName];
				} else {
					throw new Error("missing required config property: "+propName);
				}
			}, this);
		},
		render: function() {
			this.createStaveBar();
			this.createStaveVoice();
			this.formatStaveVoice();
			this.drawStaveVoice();
			this.drawStaveBar();
			return this;
		},
		createStaveBar: function() {
			var x, y, width, staveBar;

			x = this.start_x;
			y = 75 * this.clefConfig.index;
			width = this.width;
			staveBar = new Vex.Flow.Stave(x, y, width);

			if(this.barIndex === 0) {
				staveBar.addClef(this.clef);
				staveBar.addKeySignature(this.keySignature.getVexKey());
			} else {
				staveBar.setBegBarType(Vex.Flow.Barline.type.SINGLE);
			}

			staveBar.setEndBarType(Vex.Flow.Barline.type.SINGLE);
			staveBar.setContext(this.getContext());

			this.staveBar = staveBar; // save reference
		},
		createStaveVoice: function() {
			var voice, formatter;
			if(this.hasStaveNotes()) {
				voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4);
				voice.addTickables(this.getStaveNotes());
			}
			this.staveVoice = voice;
		},
		formatStaveVoice: function() {
			var formatter, voice = this.staveVoice;
			if(voice) {
				formatter = new Vex.Flow.Formatter();
				formatter.joinVoices([voice]).formatToStave([voice], this.staveBar);
			}
		},
		drawStaveVoice: function() {
			if(this.staveVoice) {
				this.staveVoice.draw(this.getContext(), this.staveBar);
			}
		},
		drawStaveBar: function() {
			var ctx = this.getContext();
			this.staveBar.draw(ctx);
		},
		// connects two staves together to form a grand staff
		connectWith: function(stave) {
			// This method should only be called *after* the stave has been rendered
			if(stave) {
				var BRACE = Vex.Flow.StaveConnector.type.BRACE;
				var ctx = this.getContext();
				var connector = new Vex.Flow.StaveConnector(this.getStaveBar(), stave.getStaveBar());
				connector.setType(BRACE).setContext(ctx).draw();
			}
			return this;
		},
		setWidth: function(w) {
			this.width = w;
		},
		getStaveBar: function() {
			return this.staveBar;
		},
		getBarIndex: function() {
			return this.barIndex;
		},
		getStartX: function() {
			return this.start_x;
		},
		getWidth: function() {
			return this.width;
		},
		getHeight: function() {
			return this.height;
		},
		getStaveNotes: function() {
			return this.staveNotater.getStaveNotes();
		},
		getContext: function() {
			return this.vexRenderer.getContext();
		},
		hasStaveNotes: function() {
			return this.staveNotater.hasStaveNotes();
		}
	});

	return Stave;
});
