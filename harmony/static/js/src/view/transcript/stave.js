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

	Stave.margin = 20;
	Stave.defaultWidth = 120;
	Stave.closestWidth = function(maxWidth, start_x) {
		start_x = start_x || 0;
		maxWidth = maxWidth - start_x - Stave.margin;

		var index = Math.floor(maxWidth / Stave.defaultWidth);
		var width = (index * Stave.defaultWidth);

		return width;
	};

	_.extend(Stave.prototype, {
		clefs: {
			'treble': { 'index': 1 },
			'bass':   { 'index': 2 }
		},
		// initialization
		init: function(config) {
			this.config = config;
			this.initConfig();

			this.clefConfig = this.clefs[this.clef];

			this.minWidth = Stave.defaultWidth;
			this.width = Stave.defaultWidth;
			this.start_x = Stave.margin + (this.barIndex * Stave.defaultWidth);
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

			if(this.isConnected()) {
				this.renderConnected();
			}

			if(this.isFirstBar()) {
				this.createStaveConnector();
			}
			this.drawStaveConnector();

			return this;
		},
		renderConnected: function() {
			this.connectedStave.render();
		},
		canRender: function() {
			if(typeof this.max_x !== 'undefined') {
				return this.start_x + Stave.defaultWidth < this.max_x;
			}
			return true;
		},
		createStaveConnector: function() {
			// This method should only be called *after* the stave has been rendered
			if(this.isConnected()) {
				var connector = new Vex.Flow.StaveConnector(this.getStaveBar(), this.connectedStave.getStaveBar());
				connector.setType(Vex.Flow.StaveConnector.type.BRACE);
				this.staveConnector = connector;
			}
		},
		drawStaveConnector: function() {
			var ctx = this.getContext();
			if(this.staveConnector) {
				this.staveConnector.setContext(ctx).draw();
			}
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
		connect: function(stave) {
			this.connectedStave = stave;
		},
		isConnected: function() {
			return this.connectedStave ? true : false;
		},
		setWidth: function(w) {
			this.width = w;
		},
		fitToWidth: function(max) {
			var is_last_bar = (this.barIndex === this.barCount - 1);
			var new_width;

			if(is_last_bar) {
				new_width = Stave.closestWidth(max, this.start_x);
				if(new_width > this.minWidth) {
					this.setWidth(new_width);
					if(this.isConnected()) {
						this.connectedStave.setWidth(new_width);
					}
				}
			}

			this.max_x = max;
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
		},
		isFirstBar: function() {
			return this.barIndex === 0;
		}
	});

	return Stave;
});
