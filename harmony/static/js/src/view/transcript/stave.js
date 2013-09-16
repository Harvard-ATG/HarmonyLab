/* global define: false */ 
define([
	'lodash', 
	'vexflow',
	'app/view/transcript/stave_note_factory'
], function(_, Vex, StaveNoteFactory) {
	"use strict";

	// Knows how to render and manipulate a staff/stave.
	var Stave = function(config) {
		this.init(config);
	};

	_.extend(Stave.prototype, {
		width: 450,
		marginLeft: 40,
		clefs: {
			'treble': { 'index': 1 },
			'bass':   { 'index': 2 }
		},
		// initialization
		init: function(config) {
			this.config = config;
			this.initConfig();

			this.staveNoteFactory = new StaveNoteFactory({
				chords: this.chords,
				keySignature: this.keySignature,
				clef: this.clef
			});
		},
		initConfig: function() {
			var required = ['clef', 'keySignature', 'chords', 'vexRenderer', 'width'];
			_.each(required, function(propName) {
				if(this.config.hasOwnProperty(propName) && this.config[propName]) {
					this[propName] = this.config[propName];
				} else {
					throw new Error("missing required config property: "+propName);
				}
			}, this);

			this.clefConfig = this.clefs[this.clef];
		},
		// renders the stave along with its notes 
		render: function() {
			var x = this.marginLeft; 
			var y = 75 * this.clefConfig.index; 
			var ctx = this.vexRenderer.getContext();
			var vexKey = this.keySignature.getVexKey();
			var stave, voice, formatter, notes;

			stave = new Vex.Flow.Stave(x, y, this.width);
			stave.addClef(this.clef);
			stave.addKeySignature(vexKey);
			stave.setContext(ctx);
			stave.draw();

			if(this.hasStaveNotes()) {
				voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4);
				voice.addTickables(this.getStaveNotes());
				formatter = new Vex.Flow.Formatter();
				formatter.joinVoices([voice]).format([voice], this.width);
				voice.draw(ctx, stave);
			}

			this.vexStave = stave; // save reference to stave

			return this;
		},
		// connects two staves together to form a grand staff
		connectWith: function(stave) {
			// This method should only be called *after* the stave has been rendered
			if(stave) {
				var BRACE = Vex.Flow.StaveConnector.type.BRACE;
				var ctx = this.vexRenderer.getContext();
				var connector = new Vex.Flow.StaveConnector(this.getVexStave(), stave.getVexStave());
		
				connector.setType(BRACE).setContext(ctx).draw();
			}
			return this;
		},
		// returns a reference to the Vex.Flow stave
		getVexStave: function() {
			return this.vexStave;
		},
		// returns a list of tickables (i.e. notes) to render
		getStaveNotes: function() {
			return this.staveNoteFactory.getStaveNotes();
		},
		// returns true if there are tickables 
		hasStaveNotes: function() {
			return this.staveNoteFactory.hasStaveNotes();
		}
	});

	return Stave;
});
