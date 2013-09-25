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
		margin: 20,
		defaultWidth: 120,
		clefs: {
			'treble': { 'index': 1 },
			'bass':   { 'index': 2 }
		},
		// initialization
		init: function(config) {
			this.config = config;
			this.initConfig();

			this.clefConfig = this.clefs[this.clef];

			this.minWidth = this.defaultWidth;
			this.width = this.defaultWidth;
			this.max_x = null;
			if(!this.start_x) {
				this.start_x = this.margin + (this.barIndex * this.defaultWidth);
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
			this.updateStaveBarWidth();
			this.drawStaveBar();

			if(this.isConnected()) {
				this.renderConnected();
				if(this.isFirstBar()) {
					this.createStaveConnector();
					this.drawStaveConnector();
				}
			}

			return this;
		},
		renderConnected: function() {
			this.connectedStave.render();
		},
		canRender: function() {
			if(this.max_x !== null) {
				return this.start_x + this.defaultWidth < this.max_x;
			}
			return true;
		},
		createStaveConnector: function() {
			var connector = new Vex.Flow.StaveConnector(this.getStaveBar(), this.connectedStave.getStaveBar());
			connector.setType(Vex.Flow.StaveConnector.type.BRACE);
			this.staveConnector = connector;
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

			if(this.isFirstBar()) {
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
		voiceTooBig: function() {
			var voice = this.staveVoice;
			if(!voice) {
				return false;
			}

			var fudge_factor = 15;
			var bb = voice.getBoundingBox();
			var offset = this.staveBar.getNoteStartX() - this.staveBar.getX();
			var width = bb.w + offset + fudge_factor;

			return width > this.defaultWidth;
		},
		updateStaveBarWidth: function(scale) {
			var new_width;
			if(scale) {
				new_width = scale * this.defaultWidth;
				if(new_width + this.start_x <= this.max_x) {
					this.setWidth(new_width);
					if(this.staveBar) {
						this.staveBar.setWidth(this.width);
					}
				}
			} else {
				scale = Math.max(
					(this.voiceTooBig() ? 2 : 0),
					(this.connectedStave && this.connectedStave.voiceTooBig() ? 2 : 0)
				);
				if(scale) {
					this.updateStaveBarWidth(scale);
					if(this.connectedStave) {
						this.connectedStave.updateStaveBarWidth(scale);
					}
				}
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
		fitToWidth: function() {
			var new_width;
			if(this.isLastBar()) {
				new_width = this.closestWidth(this.max_x, this.start_x);
				if(new_width > this.minWidth) {
					this.setWidth(new_width);
					if(this.isConnected()) {
						this.connectedStave.setWidth(new_width);
					}
				}
			}
		},
		closestWidth: function(maxWidth, start_x) {
			start_x = start_x || 0;
			maxWidth = maxWidth - start_x - this.margin;

			var index = Math.floor(maxWidth / this.defaultWidth);
			var width = (index * this.defaultWidth);

			return width;
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
		setStartX: function(x) {
			if(typeof x !== 'undefined') {
				if(this.connectedStave) {
					this.connectedStave.setStartX(x);
				}
				this.start_x = x;
			}
		},
		setMaxX: function(x) {
			if(typeof x !== 'undefined') {
				this.max_x = x;
				if(this.connectedStave) {
					this.connectedStave.setMaxX(x);
				}
			}
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
		},
		isLastBar: function() {
			return this.barIndex === this.barCount - 1;
		}
	});

	return Stave;
});
