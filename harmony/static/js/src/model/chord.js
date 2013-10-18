define([
	'lodash', 
	'microevent'
], function(
	_, 
	MicroEvent
) {
	"use strict";

	/**
	 * Creates an instance of a chord.
	 *
	 * A chord represents a collection of notes that are sounding at a
	 * given point in time (the precise point in time is not our concern).
	 *
	 * It collaborates closely with objects that interface with MIDI NOTE ON/OFF 
	 * messages. 
	 *
	 * @mixes MicroEvent
	 * @fires change
	 * @fires clear
	 * @constructor 
	 */
	var Chord = function() {
		this.init();
	};

	_.extend(Chord.prototype, {
		/**
		 * Initializes the object.
		 *
		 * @return undefined
		 */
		init: function() {
			/**
			 * Sustain flag. When true means notes should be sustained.
			 * @type {boolean}
			 * @protected
			 */
			this._sustain = false; 
			/**
			 * Transpose value expressed as the number of semitones.
			 * @type {number}
			 * @protected
			 */
			this._transpose = 0;   
			/**
			 * Container for the notes that are active.
			 * @type {object}
			 * @protected
			 */
			this._notes = {};  
		},
		/**
		 * Clears all the notes in the chord.
		 *
		 * @fires clear
		 * @return undefined
		 */
		clear: function() {
			this._notes = {};
			this.trigger('clear');
		},
		/**
		 * Command to turn on a note. 
		 *
		 * If the status of the note has changed, it will fire a change event.
		 *
		 * @fires change
		 * @param number
		 * @return {boolean} True if the note status changed, false otherwise.
		 */
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
		/**
		 * Command to turn off a note. 
		 *
		 * If the status of the note has changed, it will fire a change event.
		 *
		 * Note: this command will be ignored if the chord is sustaining notes
		 * and this method will return false.
		 *
		 * @fires change
		 * @param number
		 * @return {boolean} True if the note status changed, false otherwise.
		 */
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
		/**
		 * Commands the chord to sustain all notes that are turned on (i.e.
		 * ignore "noteOff" messages).
		 *
		 * This should be used in conjunction with the releaseSustain() method.
		 *
		 * @return undefined
		 */
		sustainNotes: function() {
			this._sustain = true;
		},
		/**
		 * Releases all sustained notes (turns them off), turns off the sustain,
		 * and triggers a change event.
		 *
		 * @fires change
		 * @return undefined
		 */
		releaseSustain: function() {
			this._notes = {}; 
			this._sustain = false; 
			this.trigger('change', 'notes:off');
		},
		/**
		 * Returns true if notes are being sustianed, false otherwise.
		 *
		 * @return {boolean} 
		 */
		isSustained: function() {
			return this._sustain ? true : false;
		},
		/**
		 * Sets the transpose for the chord and returns true if successful,
		 * false otherwise. 
		 * 
		 * Transposing the chord will raise or lower the notes by a number
		 * of semitones into different key. Setting the transpose to zero
		 * will return the chord to its original key.
		 *
		 * @param {number} value A number of semitones.
		 * @return {boolean} True if the transpose succeeded, false otherwise.
		 */
		setTranspose: function(value) {
			if(!this.isValidTranspose(value)) {
				return false;
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

			return true;
		},
		/**
		 * Returns the current transpose value.
		 *
		 * @return {number}
		 */
		getTranspose: function() {
			return this._transpose;
		},
		/**
		 * Copies the transpose to another chord.
		 *
		 * @param {Chord} chord
		 * @return undefined
		 */
		copyTranspose: function(chord) {
			this.setTranspose(chord.getTranspose());
		},
		/**
		 * Copies the sustain to another chord.
		 *
		 * @param {Chord} chord
		 * @return undefined
		 */
		copySustain: function(chord) {
			this._sustain = chord.isSustained();
		},
		/**
		 * Copies the notes to another chord.
		 *
		 * @param {Chord} chord
		 * @return undefined
		 */
		copyNotes: function(chord) {
			this._notes = _.reduce(chord.getNoteNumbers(), function(result, noteNum) {
				result[noteNum] = true;
				return result;
			}, {});
		},
		/**
		 * Returns true if the transpose value is valid, false otherwise.
		 *
		 * @param {number} value
		 * @return {boolean}
		 */
		isValidTranspose: function(value) {
			var TRANSPOSE_MIN = -12, TRANSPOSE_MAX = 12;
			if(!/^-?\d+$/.test(value)) {
				return false;
			}
			return (value >= TRANSPOSE_MIN && value <= TRANSPOSE_MAX);
		},
		/**
		 * Transposes the given note number using the current transpose setting.
		 *
		 * When transpose is set to zero, this is just the identity function.
		 *
		 * @param {number} noteNumber
		 * @return {number}
		 */
		transpose: function(noteNumber) {
			var transposed = this._transpose + noteNumber;
			if(transposed >= 0 && transposed <= 127) {
				return transposed;
			}
			return noteNumber;
		},
		/**
		 * Reverses a transpose operation.
		 *
		 * Note: noteNumber should equal untranspose(transpose(noteNumber)) 
		 * 
		 * @param {number} noteNumber
		 * @return {number}
		 */
		untranspose: function(noteNumber) {
			var untransposed = noteNumber - this._transpose;
			if(untransposed >= 0 && untransposed <= 127) {
				return untransposed;
			}
			return noteNumber;
		},
		/**
		 * This is a combined map/filter over the notes in the collection
		 * that returns a list of notes.
		 * 
		 * Optionally accepts a clef to filter the notes.
		 * Optionally accepts a callback function to execute on the notes.
		 * 
		 * - If no clef is given, all notes will be mapped over.
		 * - If no callback is given, the note number is returned.
		 *
		 * @param {string} clef treble|bass
		 * @param {function} callback
		 * @return {array} 
		 */
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
		/**
		 * Returns true if the given clef has any notes.
		 *
		 * If no clef is given, returns true if any clef has notes.
		 *
		 * @param {string} clef treble|bass
		 * @return {boolean}
		 */
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
		/**
		 * Returns all note numbers on the given clef.
		 *
		 * @param {string} clef treble|bass
		 * @return {array}
		 */
		getNoteNumbers: function(clef) {
			var callback = false; // so we just get the raw note numbers
			return this.mapNotes(clef, callback);
		},
		/**
		 * Returns a list of note numbers in sorted order.
		 *
		 * @return {array}
		 */
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
		/**
		 * Returns all note pitches and octaves on the given clef.
		 *
		 * @param {string} clef treble|bass
		 * @return {array}
		 */
		getNotePitches: function(clef) {
			return this.mapNotes(clef, function(noteNum) {
				return {
					pitchClass: (noteNum % 12),
					octave: (Math.floor(noteNum / 12) -1)
				};
			});
		},
		/**
		 * Returns true if the ntoe belongs to the given clef, false otherwise.
		 *
		 * @param {number} noteNum
		 * @param {string} clef treble|bass
		 * @return {boolean}
		 */
		noteNumBelongsToClef: function(noteNumber, clef) {
			switch(clef) {
				case 'treble':
					if(noteNumber >= 60) {
						return true;
					}
					break;
				case 'bass':
					if(noteNumber < 60) {
						return true;
					}
					break;
				default:
					throw new Error("invalid clef");
			}
			return false;
		}
	});

	/**
	 * The method getNotes() is aliased to getNoteNumbers().
	 *
	 * @param {string} clef treble|bass
	 * @return {array}
	 */
	Chord.prototype.getNotes = Chord.prototype.getNoteNumbers;

	MicroEvent.mixin(Chord); // make object observable

	return Chord;
});
