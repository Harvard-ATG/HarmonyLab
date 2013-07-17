define(['lodash', 'vexflow'], function(_, Vex) {

	// Knows how to render and manipulate a staff/stave.
	var StaveRenderer = function(config) {
		this.init(config);
	};

	_.extend(StaveRenderer.prototype, {
		width: 450,
		clefs: {
			'treble': { 'index': 1 },
			'bass':   { 'index': 2 }
		},
		init: function(config) {
			if(!this.clefs.hasOwnProperty(config.clef)) {
				throw new Error("Invalid clef");
			}
			_.extend(this, config);

			this.clefConfig = this.clefs[this.clef];
		},
		render: function() {
			var x = 25;
			var y = 75 * this.clefConfig.index; 
			var width = this.width;
			var ctx = this.vexRenderer.getContext();
			var clef = this.clef;
			var keySpec = this.keySignature.getSpec();
			var stave, voice, formatter, notes;

			stave = new Vex.Flow.Stave(x, y, width);
			stave.addClef(clef);
			stave.addKeySignature(keySpec);
			stave.setContext(ctx);
			stave.draw();

			if(this.hasNotes()) {
				voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4);
				voice.addTickables(this.getNotes());
				formatter = new Vex.Flow.Formatter();
				formatter.joinVoices([voice]).format([voice], width);
				voice.draw(ctx, stave);
			}

			this.vexStave = stave;

			return this;
		},
		connectWith: function(staveRenderer) {
			if(staveRenderer) {
				var BRACE = Vex.Flow.StaveConnector.type.BRACE
				var ctx = this.vexRenderer.getContext();
				var connector = new Vex.Flow.StaveConnector(this.getVexStave(), staveRenderer.getVexStave());
		
				connector.setType(BRACE).setContext(ctx).draw();
			}
		},
		getVexStave: function() {
			return this.vexStave;
		},
		hasNotes: function() {
			var notes = this.midiNotes.getNotesForClef(this.clef);
			return notes.length > 0;
		},
		getNotes: function() {
			var notes = this.midiNotes.getNotesForClef(this.clef);
			var keys = [], accs = [];
			var spelling = this.keySignature.getNoteSpelling();

			_.each(notes, function(noteNumber, index) {
				var note_index = noteNumber % 12; 
				var note_spelling = spelling[note_index];
				var note_letter = note_spelling.charAt(0);
				var note_accidental = note_spelling.substr(1);
				var note_octave = Math.floor(noteNumber / 12) - 1;
				if(note_index == spelling.length - 1 && note_letter == 'C') {
					++note_octave;
				}
				var note_name = note_spelling + '/' + note_octave;

				// modifiers
				if(note_accidental !== '') { 
					accs.push(function(staveNote) {
						staveNote.addAccidental(index, new Vex.Flow.Accidental(note_accidental));
					});
				}

				keys.push(note_name);
			});

			var stave_note = new Vex.Flow.StaveNote({
				keys: keys,
				duration: 'w',
				clef: this.clef
			});

			for(var i = 0, len = accs.length; i < len; i++) {
				accs[i](stave_note);
			}
	
			return [stave_note];
		}
	});

	return StaveRenderer;
});
