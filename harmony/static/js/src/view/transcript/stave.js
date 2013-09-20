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
		width: 125,
		marginLeft: 18,
		clefs: {
			'treble': { 'index': 1 },
			'bass':   { 'index': 2 }
		},
		// initialization
		init: function(config) {
			this.config = config;
			this.initConfig();

			this.clefConfig = this.clefs[this.clef];
			this.maxWidth = this.width;
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
		// renders the stave along with its notes 
		render: function() {
			this.createStaveVoice();
			this.createStaveBar();

			if(this.staveVoice) {
				this.staveVoice.draw(this.getContext(), this.staveBar);
				this.staveBar.draw(this.getContext());
			} else {
				this.staveBar.draw(this.getContext());
			}
			return this;
		},
		createStaveBar: function() {
			var x, y, width, staveBar;

			x = this.marginLeft + (this.barIndex * this.width);
			width = this.maxWidth;
			y = 75 * this.clefConfig.index;

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
		// renders one stave note
		createStaveVoice: function() {
			var voice, formatter;
			if(this.hasStaveNotes()) {
				formatter = new Vex.Flow.Formatter();
				voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4);

				voice.addTickables(this.getStaveNotes());
				formatter.joinVoices([voice]).format([voice], this.width);
			}
			this.staveVoice = voice;
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
		setMaxWidth: function(w) {
			var margin = 25;
			this.maxWidth = w - margin;
		},
		// returns a reference to the Vex.Flow stave
		getStaveBar: function() {
			return this.staveBar;
		},
		getBarIndex: function() {
			return this.barIndex;
		},
		getWidth: function() {
			return this.width;
		},
		getHeight: function() {
			return this.height;
		},
		// returns a list of tickables (i.e. notes) to render
		getStaveNotes: function() {
			return this.staveNotater.getStaveNotes();
		},
		getContext: function() {
			return this.vexRenderer.getContext();
		},
		// returns true if there are tickables 
		hasStaveNotes: function() {
			return this.staveNotater.hasStaveNotes();
		}
	});

	return Stave;
});
