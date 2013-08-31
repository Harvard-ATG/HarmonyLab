/* global define: false */
define(['lodash', 'vexflow'], function(_, Vex) {
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
		},
		initConfig: function() {
			var required = ['clef', 'keySignature', 'chord', 'vexRenderer', 'width'];
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

			if(this.hasNotes()) {
				voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4);
				voice.addTickables(this.getVexNotes());
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
		// returns true if notes exist
		hasNotes: function() {
			return this.chord.hasNotes(this.clef);
		},
		// returns a list of Vex.Flow stave notes
		getVexNotes: function() {
			var note_struct = this.getNoteKeysAndModifiers();
			var stave_note = this.makeStaveNote(note_struct.keys, note_struct.modifiers);
			return [stave_note];
		},
		// returns a list of keys and associated modifiers for constructing Vex.Flow stave notes
		getNoteKeysAndModifiers: function() {
			var keys = this.chord.getNoteKeys(this.keySignature, this.clef);
			var accidentals = this.chord.getNoteAccidentals(this.keySignature, keys);
			var modifiers = [];

			for(var i = 0, len = accidentals.length; i < len; i++) {
				if(accidentals[i]) {
					modifiers.push(this.makeAccidentalModifier(i, accidentals[i]));
				}
			}

			return {keys: keys, modifiers: modifiers};
		},
		// returns a function that will add an accidental to a Vex.Flow stave note
		makeAccidentalModifier: function(index, accidental) {
			return function(staveNote) {
				staveNote.addAccidental(index, new Vex.Flow.Accidental(accidental));
			};
		},
		// returns a new Vex.Flow stave note
		makeStaveNote: function(keys, modifiers) {
			modifiers = modifiers || [];

			var stave_note = new Vex.Flow.StaveNote({
				keys: keys,
				duration: 'w',
				clef: this.clef
			});

			for(var i = 0, len = modifiers.length; i < len; i++) {
				modifiers[i](stave_note);
			}

			return stave_note;
		}
	});

	return Stave;
});
