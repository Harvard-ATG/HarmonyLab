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
	var Chord = function(settings) {
		this.settings = settings || {};
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
			 * Container for the notes that are active.
			 * @type {object}
			 * @protected
			 */
			this._notes = {};  
			/**
			 * Sustain flag. When true means notes should be sustained.
			 * @type {boolean}
			 * @protected
			 */
			this._sustain = false; 
			/**
			 * Container for the note state changes that occur while notes are
			 * being sustained.
			 * @type {object}
			 * @protected
			 */
			this._sustained = {};
			/**
			 * Transpose value expressed as the number of semitones.
			 * @type {number}
			 * @protected
			 */
			this._transpose = 0;   
			/**
			 * Arbitrary properties associated with each note.
			 * @type {object}
			 * @protected
			 */
			this._noteProps = {};

			// initialize notes that should be on
			if("notes" in this.settings) {
				this.noteOn(this.settings.notes);
			}
		},
		/**
		 * Clears all the notes in the chord.
		 *
		 * @fires clear
		 * @return undefined
		 */
		clear: function() {
			this._notes = {};
			this._sustained = {};
			this.trigger('clear');
		},
		/**
		 * Command to turn on a note. 
		 *
		 * If the status of the note has changed, it will fire a change event.
		 *
		 * @fires change
		 * @param {number|array|object} notes The note or notes to turn on
		 * @return {boolean} True if the note status changed, false otherwise.
		 */
		noteOn: function(notes) {
			var i, noteObj, len, noteNumber; 
			var changed = false;
			var _transpose = this._transpose;
			var _sustain = this._sustain;

			// make sure the argument is an array of note numbers
			if(typeof notes === 'number') {
				notes = [notes];
			} else if(!_.isArray(notes) && typeof notes === 'object') {
				noteObj = notes;
				notes = noteObj.notes;
				if(noteObj.hasOwnProperty('overrideSustain')) {
					_sustain = noteObj.overrideSustain ? false : _sustain;
				}
			}

			for(i = 0, len = notes.length; i < len; i++) {
				noteNumber = notes[i];
				if(_transpose) {
					noteNumber = this.transpose(noteNumber);
				}
				if(_sustain) {
					this._sustained[noteNumber] = true;
				}

				if(!changed) {
					changed = (this._notes[noteNumber] !== true); 
				}
				this._notes[noteNumber] = true;
			}

			if(changed) {
				this.trigger('change', 'note:on');
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
		 * @param {number|array|object} notes The note or notes to turn off
		 * @return {boolean} True if the note status changed, false otherwise.
		 */
		noteOff: function(notes) {
			var i, noteObj, len, noteNumber; 
			var changed = false;
			var _transpose = this._transpose;
			var _sustain = this._sustain;

			// make sure the argument is an array of note numbers
			if(typeof notes === 'number') {
				notes = [notes];
			} else if(!_.isArray(notes) && typeof notes === 'object') {
				noteObj = notes;
				notes = noteObj.notes;
				if(noteObj.hasOwnProperty('overrideSustain')) {
					_sustain = noteObj.overrideSustain ? false : _sustain;
				}
			}

			for(i = 0, len = notes.length; i < len; i++) {
				noteNumber = notes[i];
				if(_transpose) {
					noteNumber = this.transpose(noteNumber);
				}
				if(_sustain) {
					this._sustained[noteNumber] = false;
				} else {
					if(!changed) {
						changed = (this._notes[noteNumber] === true);
					}
					this._notes[noteNumber] = false;
				}
			}

			if(changed) {
				this.trigger('change', 'note:off');
			}

			return changed;
		},
		/**
		 * Sets note properties.
		 * 
		 * @param {number|array} notes
		 * @param {object}
		 */
		setNoteProps: function(notes, props) {
			props = props || {};
			if(typeof notes === 'number') {
				notes = [notes];
			}
			for(var i = 0, len = notes.length; i < len; i++) {
				this._noteProps[notes[i]] = _.assign({}, props);
			}
			return this;
		},
		/**
		 * Returns all note properties.
		 *
		 * @return {object}
		 */
		getNoteProps: function() {
			return this._noteProps;
		},
		/**
		 * Returns properties associated with a single note.
		 *
		 * @return {object}
		 */
		getNoteProp: function(note) {
			if(!this._noteProps.hasOwnProperty(note)) {
				return false;
			}
			return this._noteProps[note];
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
		 * Releases the sustain.
		 *
		 * @fires change
		 * @return undefined
		 */
		releaseSustain: function() {
			this._sustain = false;
		},
		/**
		 * Synchronize the notes playing with those that are being sustained.
		 *
		 * @returns {boolean}
		 */
		syncSustainedNotes: function() {
			var _notes = this._notes;
			var _sustained = this._sustained;
			var changed = false;

			_.each(_sustained, function(state, noteNumber) {
				if(_notes[noteNumber] !== state) {
					_notes[noteNumber] = state;
					changed = true;
				}
			}, this);

			this._sustained = {};

			if(changed) {
				this.trigger('change');
			}
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
		 * @param {number} newTranspose A number of semitones.
		 * @return {boolean} True if the transpose succeeded, false otherwise.
		 */
		setTranspose: function(value) {
			if(!this.isValidTranspose(value)) {
				return false;
			}

			var new_transpose = parseInt(value, 10);
			var old_transpose = this._transpose;
			var effective_transpose = new_transpose - old_transpose;

			this._notes = _.reduce(this._notes, function(result, state, noteNumber) {
				var transposition = effective_transpose + parseInt(noteNumber, 10);
				result[transposition] = state;
				return result;	
			}, {});

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
			this._notes = _.cloneDeep(chord._notes);
			this._sustained = _.cloneDeep(chord._sustained);
		},
		/**
		 * Copies the chord.
		 *
		 * @param {Chord} chord
		 * @return this
		 */
		copy: function(chord) {
			this.copyTranspose(chord);
			this.copySustain(chord);
			this.copyNotes(chord);
			return this;
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
			var note_num;
			for(var note in _notes) {
				if(_notes.hasOwnProperty(note) && _notes[note]) {
					note_num = parseInt(note, 10); // convert string key to num
					notes.push(note_num);
				}
			}
			notes.sort(function(a, b) {
				return a - b;
			});
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
					noteNum: noteNum,
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
