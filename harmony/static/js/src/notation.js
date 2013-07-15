define(['lodash', 'vexflow', 'app/eventbus'], function(_, Vex, eventBus) {

	//--------------------------------------------------
	var MidiNotes = function() {
		this.init();
	};
	_.extend(MidiNotes.prototype, {
		init: function() {
			this._notes = {};
		},
		noteOn: function(number) {
			this._notes[number] = true;
		},
		noteOff: function(number) {
			delete this._notes[number];
		},
		getNotes: function() {
			return _.keys(this._notes);
		},
		getNotesForClef: function(clef) {
			var notes = [], _notes = this._notes; 
			var note;
			for(note in _notes) {
				switch(clef) {
					case 'treble':
						if(note >= 60) {
							notes.push(note);
						}
						break;
					case 'bass':
						if(note < 60) {
							notes.push(note);
						}
						break;
					default:
						throw new Error("invalid clef");
				}
			}
			return notes;
		}
	});

	//--------------------------------------------------
	var KeySignature = function() {};
	_.extend(KeySignature.prototype, {
		_defaultKeySpec: 'C',
		_keySpec: '',
		_keySpelling: {
			"Ab":  ["C","Db","D","Eb","Fb","F","Gb","G","Ab","Bbb","Bb","Cb"],
			"Cbm": ["C","Db","D","Eb","Fb","F","Gb","G","Ab","Bbb","Bb","Cb"], 
			"Eb":  ["C","Db","D","Eb","Fb","F","Gb","G","Ab","A","Bb","Cb"],
			"Gbm": ["C","Db","D","Eb","Fb","F","Gb","G","Ab","A","Bb","Cb"],
			"Bb":  ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","Cb"],
			"Dbm": ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","Cb"],
			"F":   ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],
			"Abm": ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"],
			"C":   ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
			"Ebm": ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
			"G":   ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
			"Bbm": ["C","C#","D","Eb","E","F","F#","G","Ab","A","Bb","B"],
			"D":   ["C","C#","D","Eb","E","F","F#","G","G#","A","Bb","B"],
			"Fm":  ["C","C#","D","Eb","E","F","F#","G","G#","A","Bb","B"],
			"A":   ["C","C#","D","D#","E","F","F#","G","G#","A","Bb","B"],
			"Cm":  ["C","C#","D","D#","E","F","F#","G","G#","A","Bb","B"], 
			"E":   ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
			"Gm":  ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
			"B":   ["C","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
			"Dm":  ["C","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
			"F#":  ["B#","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
			"Am":  ["B#","C#","D","D#","E","E#","F#","G","G#","A","A#","B"],
			"C#":  ["B#","C#","D","D#","E","E#","F#","F##","G#","A","A#","B"],
			"Em":  ["B#","C#","D","D#","E","E#","F#","F##","G#","A","A#","B"],
			"G#":  ["B#","C#","C##","D#","E","E#","F#","F##","G#","A","A#","B"],
			"Bm":  ["B#","C#","C##","D#","E","E#","F#","F##","G#","A","A#","B"],
			"D#":  ["B#","C#","C##","D#","E","E#","F#","F##","G#","G##","A#","B"],
			"F#m": ["B#","C#","C##","D#","E","E#","F#","F##","G#","G##","A#","B"],
			"A#":  ["B#","C#","C##","D#","D##","E#","F#","F##","G#","G##","A#","B"],
			"C#m": ["B#","C#","C##","D#","D##","E#","F#","F##","G#","G##","A#","A##"]
		},
		_accidentalOrder: ['F','C','G','D','A','E','B'],
		setSpec: function(key) {
			if(!Vex.Flow.keySignature.keySpecs[key]) {
				throw new Error("invalid key spec");
			}
			this._keySpec = key;
		},
		getSpec: function() {
			return this._keySpec || this._defaultKeySpec;
		},
		getNoteSpelling: function() {
			return this._keySpelling[this.getSpec()];
		},
		getAccidentals: function() {
			var spec = Vex.Flow.keySignature.keySpecs[this.getSpec()];
			var order = this._accidentalOrder.slice(0); // copy
			if(spec.acc == 'b') {
				order.reverse();
			}

			return _.map(order.slice(0, spec.num), function(note) {
				return note + (spec.acc||'');
			});
		}
	});

	//--------------------------------------------------
	var StaveRenderer = function(config) {
		this.init(config);
	};
	_.extend(StaveRenderer.prototype, {
		width: 180,
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

	//--------------------------------------------------
	var Notation = function() {
		this.init();
	};
	_.extend(Notation.prototype, {
		eventBus: eventBus,
		midiNotes: new MidiNotes(),
		keySignature: new KeySignature(),
		css: {
			'background-color': '#eed',
			'padding': '10px',
			'border': '1px solid #ddc'
		},
		init: function() {
			this.el = $('<canvas></canvas>');
			this.el.css(this.css);
			this.el[0].width = 520;
			this.el[0].height = 380;

			this.vexRenderer = new Vex.Flow.Renderer(this.el[0], Vex.Flow.Renderer.Backends.CANVAS);

			this.staves = [];
			this.addStave({ clef: 'treble' });
			this.addStave({ clef: 'bass' });

			this.onNoteRender = _.bind(this.onNoteRender, this);
			this.eventBus.bind('note:render', this.onNoteRender);
		},
		clear: function() {
			this.vexRenderer.getContext().clear();
		},
		render: function() { 
			this.clear();
			this.renderStaves();
			this.connectStaves();
			return this;
		},
		addStave: function(config) {
			_.extend(config, {
				midiNotes: this.midiNotes,
				keySignature: this.keySignature,
				vexRenderer: this.vexRenderer
			});
			this.staves.push(new StaveRenderer(config));
		},
		renderStaves: function() {
			var i, len;
			for(i = 0, len = this.staves.length; i < len; i++) {
				this.staves[i].render();
			}
		},
		connectStaves: function() {
			if(this.staves.length === 2) { 
				this.staves[0].connectWith(this.staves[1]);
			}
		},
		changeKey: function(spec) {
			this.keySignature.setSpec(spec);
			this.render();
		},
		onNoteRender: function(eventName, noteNumber, noteVelocity) {
			var toggle = (eventName == 'on'? 'noteOn' : 'noteOff');
			this.midiNotes[toggle](noteNumber);
			this.render();
		}
	});

	return Notation;
});
