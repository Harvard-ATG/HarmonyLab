/* global define: false */
define(['lodash', 'microevent'], function(_, MicroEvent) {
	"use strict";

	// This object is responsible for knowing which MIDI notes are active at one time
	// and how to manipulate their representation and select them by clef.
	//
	// This object is observable and fires "change" events when a note is
	// turned on or off.
	
	var Chord = function() {
		this._notes = {};
		this._sustained = {};
	};

	_.extend(Chord.prototype, {
		// Command to turn on a note. Fires a change event if the note status has changed.
		// Returns true if the note status was changed, false otherwise.
		noteOn: function(number) {
			var changed = (this._notes[number] !== true); 
			this._notes[number] = true;
			if(this.sustain) {
				this._sustained[number] = true;
			}
			if(changed) {
				this.trigger('change', 'on', number);
			}
			return changed;
		},
		// Command to turn off a note. Fires a change event if the note status has changed.
		// Returns true if the note status was changed, false otherwise.
		//
		// NOTE: this command is ignored as long as the note has been sustained.
		noteOff: function(number) {
			var changed;
			if(this._sustained[number]) {
				return false;
			} 

			changed = (this._notes[number] === true);
			delete this._notes[number];
			if(changed) {
				this.trigger('change', 'off', number);
			}

			return changed;
		},
		// Returns true if the note is on, false otherwise
		isNoteOn: function(number) {
			return this._notes[number] ? true : false;
		},
		// All subsequent notes that are turned on should be sustained until
		// such time as they are released. Should be used in conjunction with
		// releaseSustain().
		sustainNotes: function() {
			this.sustain = true;
		},
		// Releases all sustained notes (turns them off) and triggers a change event.
		releaseSustain: function() {
			var _sustained = this._sustained;
			var _notes = this._notes;
			var notes = [];

			this.sustain = false; 
			this._sustained = {}; 

			_.each(_sustained, function(state, number) {
				notes.push(number);
				delete _notes[number];
			});

			this.trigger('change', 'off', notes);
		},
		// Returns a list of notes for the given clef.
		getNotes: function(clef) {
			return this.getNoteNumbers(clef);
		},
		// Returns all notes in sorted order.
		getSortedNotes: function() {
			var _notes = this._notes, notes_sorted = [];
			var note_num, i, len;

			for(note_num in _notes) {
				if(_notes.hasOwnProperty(note_num)) {
					notes_sorted.push(note_num);
				}
			}

			notes_sorted.sort();

			return notes_sorted;
		},
		// Returns a list that is the result of executing a callback on each
		// note. If no clef is specified, all notes are mapped, otherwise
		// notes are filtered by clef.
		mapNotes: function(callback, clef) {
			var mapped_notes = [], notes_sorted = this.getSortedNotes();
			var wanted = true, note_num, i, len;

			for(i = 0, len = notes_sorted.length; i < len; i++) {
				note_num = notes_sorted[i];
				if(clef) {
					wanted = this.noteNumBelongsToClef(note_num, clef);
				}
				if(wanted) {
					mapped_notes.push(callback.call(this, note_num));
				}
			}

			return mapped_notes;
		},
		// Returns true if the clef has any notes, or if no clef is specified,
		// if any notes exist on any clefs.
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
		// Returns all note numbers on the given clef.
		getNoteNumbers: function(clef) {
			return this.mapNotes(function(noteNum) {
				return noteNum;
			}, clef);
		},
		// Returns all note pitches and octaves on the given clef.
		getNotePitches: function(clef) {
			return this.mapNotes(function(noteNum) {
				return {
					pitchClass: (noteNum % 12),
					octave: (Math.floor(noteNum / 12) -1)
				};
			}, clef);
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

	MicroEvent.mixin(Chord); // make object observable

	return Chord;
});
