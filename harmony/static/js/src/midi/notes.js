define(['lodash', 'microevent'], function(_, MicroEvent) {

	// Knows which notes are currently active.
	var MidiNotes = function() {
		this._notes = {};
	};

	_.extend(MidiNotes.prototype, {
		noteOn: function(number) {
			var changed = (this._notes[number] !== true); 
			this._notes[number] = true;
			if(changed) {
				this.trigger('note:change', 'on', number);
			}
		},
		noteOff: function(number) {
			var changed = (this._notes[number] === true);
			delete this._notes[number];
			if(changed) {
				this.trigger('note:change', 'off', number);
			}
		},
		getNotes: function(clef) {
			return this.getNoteNumbers(clef);
		},
		iterNotes: function(callback, clef) {
			var notes = [], _notes = this._notes;
			var note_num, wanted = true;
			for(note_num in _notes) {
				if(_notes.hasOwnProperty(note_num)) {
					if(clef) {
						wanted = this.noteNumBelongsToClef(note_num, clef);
					}
					if(wanted) {
						notes.push(callback.call(this, note_num));
					}
				}
			}
			return notes;
		},
		hasNotes: function(clef) {
			var note_num, _notes = this._notes;
			for(note_num in _notes) {
				if(_notes.hasOwnProperty(note_num)) {
					if(clef) {
						if(this.noteNumBelongsToClef(note_num, clef)) {
							return true;
						}
					} else {
						return true;
					}
				}
			}
			return false;
		},
		getNoteNumbers: function(clef) {
			return this.iterNotes(function(noteNum) {
				return noteNum;
			}, clef);
		},
		getNotePitches: function(clef) {
			return this.iterNotes(function(noteNum) {
				return {
					pitchClass: (noteNum % 12),
					octave: (Math.floor(noteNum / 12) -1)
				};
			}, clef);
		},
		noteNumBelongsToClef: function(noteNum, clef) {
			switch(clef) {
				case 'treble':
					if(noteNum >= 60) {
						return true;
					}
					break;
				case 'bass':
					if(noteNum < 60) {
						return true;
					}
					break;
				default:
					throw new Error("invalid clef");
			}
			return false;
		}
	});

	MicroEvent.mixin(MidiNotes); // make object observable

	return MidiNotes;
});
