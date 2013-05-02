define(['lodash', 'vexflow', 'radio'], function(_, Vex, radio) {

	/**
	 * Notation object for converting MIDI notes to musical notation and
	 * displaying the notes on the screen as they are played.
	 */
	var Notation = function() {
		this.init();
	};

	_.extend(Notation.prototype, {
		/**
		 * Size of the canvas and staves.
		 */
		canvasSize: { 
			width: 225, 
			height: 250 // note: height is padded a bit for low notes on the 88-key piano
		},

		/**
		 * Size of the staff (i.e. stave).
		 */
		staveSize: { width: 180 },

		/**
		 * Reference to radio event bus.
		 */
		radio: radio,

		/**
		 * Map of midi notes currently playing.
		 */
		midiNotesPlaying: {},
	
		/**
		 * Initialize.
		 */
		init: function() {
			this.el = $('<canvas></canvas>');

			// TODO: move to CSS
			this.el.css({
				'margin': '0 auto',
				'background-color': '#eed',
				'padding': '10px',
				'border': '1px solid #ddc'
			});

			this.el[0].height = this.canvasSize.height;
			this.el[0].width = this.canvasSize.width;

			this.renderer = new Vex.Flow.Renderer(this.el[0], Vex.Flow.Renderer.Backends.CANVAS);

			this.radio('note').subscribe([this.onNoteEvent, this]);
		},
		/**
		 * Renders the notation.
		 * @return {this}
		 */
		render: function() { 
			this.renderer.getContext().clear();
			this.renderStaves();
			return this;
		},
		/**
		 * Renders the stave(s).
		 * @return {this}
		 */
		renderStaves: function() {
			var ctx = this.renderer.getContext();
			var x = 25;
			var width = this.staveSize.width;
			var keySignatureSpec = 'C';
			var vexNotes = this.getVexNotes();
			var clefs = {}, voices = [];
			var staveConnector, formatter;

			_.each(['treble','bass'], function(clef, index) {
				var y = 75 * index, stave, voice, keySignature;

				stave = new Vex.Flow.Stave(x, y, width);
				stave.addClef(clef);
				stave.addKeySignature(keySignatureSpec);
				stave.setContext(ctx).draw();

				if(vexNotes[clef] && vexNotes[clef].length > 0) {
					voice = new Vex.Flow.Voice(Vex.Flow.TIME4_4);
					voice.addTickables(vexNotes[clef]);
					voices.push(voice);
				}

				clefs[clef] = {
					'stave': stave,
					'voice': voice,
				};
			});

			staveConnector = new Vex.Flow.StaveConnector(clefs.treble.stave, clefs.bass.stave);
			staveConnector.setType(Vex.Flow.StaveConnector.type.BRACE).setContext(ctx).draw();

			if(voices.length > 0) {
				formatter = new Vex.Flow.Formatter()
					.joinVoices(voices)
					.format(voices, width);

				_.each(clefs, function(clef, name) {
					if(clef.voice) {
						clef.voice.draw(ctx, clef.stave);
					}
				});
			}

			return this;
		},
		/**
		 * Returns notes that are playing for Vex.Flow rendering.
		 * @return {this}
		 */
		getVexNotes: function() {
			var ctx = this.renderer.getContext();
			var midiNotesPlaying = _.keys(this.midiNotesPlaying);
			var notes = {'treble': [], 'bass': []};
			var accidentals = ["C","C#","D","D#","E","F","F#","G","G#","A","Bb","B"]; // for C Major
			var vex_notes = {};

			_.each(this.midiNotesPlaying, function(on, noteNumber) {
				var octave = Math.floor(noteNumber / 12) - 1;
				var relativeNoteNumber = noteNumber % 12;
				var note = accidentals[relativeNoteNumber];
				var note_name = note + '/' + octave;
				var clef = (noteNumber > 59 ? 'treble' : 'bass');
				var accidental = note.substr(1);
	
				notes[clef].push({ name: note_name, accidental: accidental});
			});

			_.each(notes, function(notes, clef) {
				var stave_note;
				vex_notes[clef] = [];
				if(notes.length > 0) {
					console.log(_.pluck(notes, 'name'), _.pluck(notes, 'accidental'));
					stave_note = new Vex.Flow.StaveNote({ 
						keys: _.pluck(notes, 'name'),
						duration: "w", 
						clef: clef 
					});
					_.each(_.pluck(notes, 'accidental'), function(acc, index) {
						if(acc !== '') {
							stave_note.addAccidental(index, new Vex.Flow.Accidental(acc));
						}
					});
					vex_notes[clef].push(stave_note);
				}
			});

			return vex_notes;
		},
		/**
		 * Handles note on/off events and upates the map of notes that
		 * are currently playing. 
		 *
		 * @param {string} eventName on|off
		 * @param {integer} noteNumber the midi note number
		 * @param {integer} noteVelocity defaults to 100
		 */
		onNoteEvent: function(eventName, noteNumber, noteVelocity) {
			if(eventName === 'on') {
				this.midiNotesPlaying[noteNumber] = true;
			} else {
				delete this.midiNotesPlaying[noteNumber];
			}
			this.render();
		}
	});

	return Notation;
});
