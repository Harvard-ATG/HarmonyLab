/* global define: false */ 
define([
	'lodash', 
	'vexflow',
], function(_, Vex, StaveNotater) {
	"use strict";

	// Knows how to render a single bar of a staff.
	var Stave = function(clef, barIndex) {
		this.init(clef, barIndex);
	};

	_.extend(Stave.prototype, {
		margin: 30,
		firstBarWidth: 90,
		defaultWidth: 123,
		init: function(clef, barIndex) {
			this.clef = clef;
			this.barIndex = barIndex;

			if(this.barIndex === 0) {
				this.start_x = this.margin;
				this.width = this.firstBarWidth;
				this.minWidth = this.firstBarWidth;
			} else {
				this.start_x = this.margin + this.firstBarWidth + ((this.barIndex - 1) * this.defaultWidth);
				this.minWidth = this.defaultWidth;
				this.width = this.defaultWidth;
			}

			this.start_y = 75 * (clef === 'treble' ? 1 : 2);
			this.max_x = null;

			this.displayConfig = {
				clef: false,
				keySignature: false,
				staveConnector: false
			};
		},
		render: function() {
			this.createStaveBar();
			this.createStaveVoice();
			this.formatStaveVoice();

			this.drawStaveVoice();
			this.drawStaveBar();

			if(this.isConnected()) {
				this.renderConnected();
				this.renderStaveConnector();
			}

			return this;
		},
		renderConnected: function() {
			this.doConnected('render');
		},
		renderStaveConnector: function() {
			if(this.displayConfig.staveConnector) {
				this.createStaveConnector();
				this.drawStaveConnector();
			}
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
			var x = this.start_x;
			var y = this.start_y; 
			var width = this.width;
			var staveBar = new Vex.Flow.Stave(x, y, width);

			staveBar.setBegBarType(Vex.Flow.Barline.type.SINGLE);
			staveBar.setEndBarType(Vex.Flow.Barline.type.SINGLE);
			staveBar.setContext(this.getContext());

			if(this.displayConfig.clef) {
				staveBar.addClef(this.clef);
			}
			if(this.displayConfig.keySignature) {
				staveBar.addKeySignature(this.keySignature.getVexKey());
			} 

			this.staveBar = staveBar;
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
		fitToWidth: function() {
			var new_width = this.closestWidth(this.max_x, this.start_x);
			if(new_width > this.minWidth) {
				this.setWidth(new_width);
			}
		},
		closestWidth: function(maxWidth, start_x) {
			return maxWidth - start_x - this.margin;
		},
		setStartX: function(x) {
			this.start_x = x;
			this.doConnected('setStartX', x);
		},
		setMaxX: function(x) {
			this.max_x = x;
			this.doConnected('setMaxX', x);
		},
		setWidth: function(w) {
			this.width = w;
			this.doConnected('setWidth', w);
		},
		setNotater: function(notater) {
			this.staveNotater = notater;
		},
		connect: function(stave) {
			this.connectedStave = stave;
		},
		isConnected: function() {
			return this.connectedStave ? true : false;
		},
		doConnected: function(method) {
			var args = Array.prototype.slice.call(arguments, 1);
			if(this.isConnected()) {
				this.connectedStave[method].apply(this.connectedStave, args);
			}
		},
		getConnected: function() {
			return this.connectedStave;
		},
		getWidth: function() {
			return this.width;
		},
		getHeight: function() {
			return this.height;
		},
		getStaveBar: function() {
			return this.staveBar;
		},
		getStartX: function() {
			return this.start_x;
		},
		getStaveNotes: function() {
			return this.staveNotater.getStaveNotes();
		},
		getContext: function() {
			return this.vexRenderer.getContext();
		},
		hasStaveNotes: function() {
			if(this.staveNotater) {
				return this.staveNotater.hasStaveNotes();
			}
			return false;
		},
		setKeySignature: function(keySignature) {
			this.keySignature = keySignature;
		},
		setRenderer: function(renderer) {
			this.vexRenderer = renderer;
		},
		setDisplayOptions: function(opts) {
			opts = opts || {};
			this.displayConfig = this.displayConfig || {};
			_.extend(this.displayConfig, opts);
		},
		enableDisplayOptions: function(opts) {
			var trueVal = function() { return true; };
			var displayConfig = _.zipObject(opts, _.map(opts, trueVal));
			this.setDisplayOptions(displayConfig);
		}
	});

	return Stave;
});
