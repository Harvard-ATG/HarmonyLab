define(['lodash', 'vexflow', 'app/eventbus', 'app/notation/keysignature'], function(_, Vex, eventBus, KeySignature) {

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
			var keySpec = 'C' || this.keySignature.getSpec();
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
			var accidentals = ["C","Db","D","Eb","E","F","F#","G","Ab","A","Bb","B"];

			_.each(notes, function(noteNumber, index) {
				var octave = Math.floor(noteNumber / 12) - 1;
				var note = accidentals[noteNumber % 12];
				var note_name = note + '/' + octave;
				var accidental = note.substr(1);

				keys.push(note_name);
				accs.push(accidental);
			});

			var stave_note = new Vex.Flow.StaveNote({
				keys: keys,
				duration: 'w',
				clef: this.clef
			});

			for(var i = 0, len = accs.length; i < len; i++) {
				if(accs[i] !== '') {
					stave_note.addAccidental(i, new Vex.Flow.Accidental(accs[i]));
				}
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
		onNoteRender: function(eventName, noteNumber, noteVelocity) {
			var toggle = (eventName == 'on'? 'noteOn' : 'noteOff');
			this.midiNotes[toggle](noteNumber);
			this.render();
		}
	});

	return Notation;
});
