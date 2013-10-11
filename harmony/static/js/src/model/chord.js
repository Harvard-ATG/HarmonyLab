/* global define: false */
define(['lodash', 'microevent'], function(_, MicroEvent) {
	"use strict";

	// This object is responsible for knowing which MIDI notes are active at one time
	// and how to manipulate their representation and select them by clef.
	//
	// This object is observable and fires "change" events when a note is
	// turned on or off.
	
	var Chord = function() {
		this.init();
	};

	_.extend(Chord.prototype, {
		init: function() {
			this._sustain = false; // flag to indicate if notes are sustained or not
			this._transpose = 0;   // integer used for transposing notes 
	
			this._notes = {};     // holds notes that are playing
		},
		// Clears all notes and triggers a change event.
		clear: function() {
			this._notes = {};
			this.trigger('change', 'notes:clear');
		},
		// Command to turn on a note. Fires a change event if the note status has changed.
		// Returns true if the note status was changed, false otherwise.
		noteOn: function(number) {
			var changed;

			if(this._transpose) {
				number = this.transpose(number);
			}

			changed = (this._notes[number] !== true); 
			this._notes[number] = true;

			if(changed) {
				this.trigger('change', 'note:on', number);
			}

			return changed;
		},
		// Command to turn off a note. Fires a change event if the note status has changed.
		// Returns true if the note status was changed, false otherwise.
		//
		// NOTE: this command is ignored as long as the note has been sustained.
		noteOff: function(number) {
			var changed;

			if(this.isSustained()) {
				return false;
			} 
			if(this._transpose) {
				number = this.transpose(number);
			}

			changed = (this._notes[number] === true);
			delete this._notes[number];

			if(changed) {
				this.trigger('change', 'note:off', number);
			}

			return changed;
		},
		// All notes that are turned on should be sustained until
		// such time as they are released. Should be used in conjunction with
		// releaseSustain(). 
		sustainNotes: function() {
			this._sustain = true;
		},
		// Releases all sustained notes (turns them off) and triggers a change event.
		releaseSustain: function() {
			this._notes = {}; 
			this._sustain = false; 
			this.trigger('change', 'notes:off');
		},
		// Returns true if the notes are being sustained, false otherwise.
		isSustained: function() {
			return this._sustain ? true : false;
		},
		// Sets the transpose for the chord and returns true if it succeeds,
		// false otherwise.
		setTranspose: function(value) {
			if(!this.isValidTranspose(value)) {
				return;
			}

			var old_transpose = this._transpose;
			var new_transpose = parseInt(value, 10);
			var effective_transpose = new_transpose - old_transpose;

			var transposeNote = function(state, noteNumber) {
				return effective_transpose + parseInt(noteNumber, 10);
			};
			var trueValue = function() {
				return true;
			};

			var trans_notes = _.map(this._notes, transposeNote);
			var trans_values = _.map(trans_notes, trueValue);

			this._notes = _.zipObject(trans_notes, trans_values);
			this._transpose = new_transpose;
			this.trigger('change', 'notes:transpose');
		},
		// Returns the current transpose value.
		getTranspose: function() {
			return this._transpose;
		},
		// Copies the transpose from another chord.
		copyTranspose: function(chord) {
			this.setTranspose(chord.getTranspose());
		},
		// Copies the sustain setting from another chord.
		copySustain: function(chord) {
			var is_sustained = chord.isSustained();
			if(is_sustained) {
				this._sustain = true;
				this.copyNotes(chord);
			} else {
				this._sustain = false;
			}
		},
		// Copies the notes setting from another chord
		copyNotes: function(chord) {
			this._notes = _.reduce(chord.getNoteNumbers(), function(result, noteNum) {
				result[noteNum] = true;
				return result;
			}, {});
		},
		// Checks if the transpose value is valid or not.
		isValidTranspose: function(value) {
			var TRANSPOSE_MIN = -12, TRANSPOSE_MAX = 12;
			if(!/^-?\d+$/.test(value)) {
				return false;
			}
			return (value >= TRANSPOSE_MIN && value <= TRANSPOSE_MAX);
		},
		// Returns a transposed note number using the current transpose value.
		transpose: function(noteNumber) {
			var transposed = this._transpose + noteNumber;
			if(transposed >= 0 && transposed <= 127) {
				return transposed;
			}
			return noteNumber;
		},
		// Reversed the transpose function.
		untranspose: function(noteNumber) {
			var untransposed = noteNumber - this._transpose;
			if(untransposed >= 0 && untransposed <= 127) {
				return untransposed;
			}
			return noteNumber;
		},
		// Maps over each note in the chord.
		//
		// Optionally accepts a clef to filter the notes that are mapped and a 
		// callback to execute on each note. 
		//
		//	- If no clef is specified (falsy), all notes are mapped.
		//	- If no callback is specified (falsy), the note number is 
		//	returned by default.
		//
		mapNotes: function(clef, callback) {
			var mapped_notes = [], notes = this.getSortedNotes();
			var wanted = true, note_num, i, len;

			for(i = 0, len = notes.length; i < len; i++) {
				note_num = parseInt(notes[i], 10);
				if(clef) {
					wanted = this.noteNumBelongsToClef(note_num, clef);
				}
				if(wanted) {
					if(callback) {
						mapped_notes.push(callback.call(this, note_num));
					} else {
						mapped_notes.push(note_num);
					}
				}
			}

			return mapped_notes;
		},
		// Returns true if the clef has any notes, or if no clef is specified,
		// if any notes exist on any clefs.
		hasNotes: function(clef) {
			var notes = this.getSortedNotes();
			var note_num, i, len;
			for(i = 0, len = notes.length; i < len; i++) {
				note_num = parseInt(notes[i], 10);
				if(clef) {
					if(this.noteNumBelongsToClef(note_num, clef)) {
						return true;
					}
				} else {
					return true;
				}
			}
				
			return false;
		},
		// Returns all note numbers on the given clef.
		getNoteNumbers: function(clef) {
			var callback = false; // so we just get the raw note numbers
			return this.mapNotes(clef, callback);
		},
		// Returns a list of note numbers in sorted order.
		getSortedNotes: function() {
			var _notes = this._notes;
			var notes = [];
			for(var note in _notes) {
				if(_notes.hasOwnProperty(note)) {
					notes.push(note);
				}
			}
			notes.sort();
			return notes;
		},
		// Returns all note pitches and octaves on the given clef.
		getNotePitches: function(clef) {
			return this.mapNotes(clef, function(noteNum) {
				return {
					pitchClass: (noteNum % 12),
					octave: (Math.floor(noteNum / 12) -1)
				};
			});
		},
		// Returns true if the note belongs to the clef, false otherwise.
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

	Chord.prototype.getNotes = Chord.prototype.getNoteNumbers;

	MicroEvent.mixin(Chord); // make object observable

	return Chord;
});
