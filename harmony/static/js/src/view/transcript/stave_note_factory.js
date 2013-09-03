/* global define: false */ 
define([
	'lodash', 
	'vexflow'
], function(_, Vex, Analyzing) {
	"use strict";

	var StaveNoteFactory = function(config) {
		this.init(config);
	};

	_.extend(StaveNoteFactory.prototype, {
		// options to highlight notes based on certain musical phenomena
		highlights: {
			enabled: false,
			options: {
				roots: false,
				doubles: false,
				tritones: false,
				octaves: false
			}
		},
		init: function(config) {
			this.config = config;
			this.initConfig();
		},
		initConfig: function() {
			var required = ['chord', 'keySignature', 'clef'];
			_.each(required, function(propName) {
				if(this.config.hasOwnProperty(propName)) {
					this[propName] = this.config[propName];
				} else {
					throw new Error("missing required config property: "+propName);
				}
			}, this);
		},
		// returns true if there are any notes 
		hasStaveNotes: function() {
			return this.chord.hasNotes(this.clef);
		},
		// returns a list of Vex.Flow stave notes
		getStaveNotes: function(clef) {
			var note_struct = this._getNoteKeysAndModifiers();
			var stave_note = this._makeStaveNote(note_struct.keys, note_struct.modifiers);
			return [stave_note];
		},
		// returns a list of keys and associated modifiers for constructing Vex.Flow stave notes
		_getNoteKeysAndModifiers: function() {
			var keys = this.chord.getNoteKeys(this.keySignature, this.clef);
			var accidentals = this.chord.getNoteAccidentals(this.keySignature, keys);
			var modifiers = [];

			for(var i = 0, len = accidentals.length; i < len; i++) {
				if(accidentals[i]) {
					modifiers.push(this._makeAccidentalModifier(i, accidentals[i]));
				}
			}

			return {keys: keys, modifiers: modifiers};
		},
		// returns a function that will add an accidental to a Vex.Flow stave note
		_makeAccidentalModifier: function(index, accidental) {
			return function(staveNote) {
				staveNote.addAccidental(index, new Vex.Flow.Accidental(accidental));
			};
		},
		// returns a new Vex.Flow stave note
		_makeStaveNote: function(keys, modifiers) {
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

	return StaveNoteFactory;
});
