define(['lodash', 'vexflow'], function(_, Vex) {

	// Knows how to render and manipulate a staff/stave.
	var StaveRenderer = function(config) {
		this.init(config);
	};

	_.extend(StaveRenderer.prototype, {
		width: 450,
		marginLeft: 40,
		clefs: {
			'treble': { 'index': 1 },
			'bass':   { 'index': 2 }
		},
		// initialization
		init: function(config) {
			if(!this.clefs.hasOwnProperty(config.clef)) {
				throw new Error("Invalid clef");
			}
			_.extend(this, config);

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
		connectWith: function(staveRenderer) {
			// This method should only be called *after* the stave has been rendered
			if(staveRenderer) {
				var BRACE = Vex.Flow.StaveConnector.type.BRACE
				var ctx = this.vexRenderer.getContext();
				var connector = new Vex.Flow.StaveConnector(this.getVexStave(), staveRenderer.getVexStave());
		
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
			return this.midiNotes.hasNotes(this.clef);
		},
		// returns a list of Vex.Flow stave notes
		getVexNotes: function() {
			var note_struct = this.getNoteKeysAndModifiers();
			var stave_note = this.makeStaveNote(note_struct.keys, note_struct.modifiers);
			return [stave_note];
		},
		// returns a list of keys and associated modifiers for constructing Vex.Flow stave notes
		getNoteKeysAndModifiers: function() {
			var notes = this.midiNotes.getNotePitches(this.clef);
			var keys = [], modifiers = [];
			var i, len, note, spelling;

			for(i = 0, len = notes.length; i < len; i++) {
				note = notes[i];
				spelling = this.keySignature.spellingOf(note.pitchClass, note.octave);

				keys.push(spelling.key_name);
				if(spelling.has_accidental) {
					modifiers.push(this.makeAccidentalModifier(i, spelling.accidental));
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

	return StaveRenderer;
});
