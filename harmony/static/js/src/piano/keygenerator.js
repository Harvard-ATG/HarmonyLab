define(['lodash'], function(_) {

	/**
	 * The PianoKeyGenerator object is responsible for knowing how to generate a
	 * sequence of keys for different piano keyboard sizes. It does not store
	 * any state on its own.
	 */
	var PianoKeyGenerator = {

		/**
		 * White keys are represented by one of the 7 main notes in the western musical alphabet. 
		 */
		noteValues: 'ABCDEFG',

		/**
		 * Black keys represent half steps between the main notes (sharp or flat).
		 */
		blackNote: '-',

		/**
		 * Black keys are arranged in groups of 2's and 3's after specific notes.
		 */
		blackNotesAfter: 'ACDFG',

		/**
		 * Maps valid keyboard sizes to configuration parameters. 
		 */
		keyboardSizes: {
			25: { 'firstNote': 'C', 'firstNoteNumber': 48 }, 
			37: { 'firstNote': 'C', 'firstNoteNumber': 48 }, 
			49: { 'firstNote': 'C', 'firstNoteNumber': 36 }, 
			61: { 'firstNote': 'C', 'firstNoteNumber': 36 }, 
			88: { 'firstNote': 'A', 'firstNoteNumber': 12 }
		},

		/**
		 * Returns a string representing the first note on the keyboard. 
		 *
		 * @param {integer} size The keyboard size.
		 * @return {string} 
		 */
		firstNote: function(size) {
			if(!this.keyboardSizes.hasOwnProperty(size)) {
				throw new Error("Unknown first note for keyboard size.");
			}
			return this.keyboardSizes[size].firstNote;
		},

		/**
		 * Returns the first note number.
		 *
		 * @param {integer} size The keyboard size.
		 * @return {integer}
		 */
		firstNoteNumber: function(size) {
			if(!this.keyboardSizes.hasOwnProperty(size)) {
				throw new Error("Unknown first note for keyboard size.");
			}
			return this.keyboardSizes[size].firstNoteNumber;
		},

		/**
		 * Returns the next white key note in the musical alphabet. 
		 *
		 * @param {string} noteValue The current note value.
		 * @return {string}
		 */
		nextNote: function(noteValue) {
			var index = this.noteValues.indexOf(noteValue);
			if(index === -1) {
				throw new Error("Invalid key.");
			}
			return this.noteValues.charAt((index + 1) % this.noteValues.length);
		},

		/**
		 * Returns true if the note value represents a white key, or false if
		 * it's a black key.
		 *
		 * @param {string} noteValue The note.  
		 * @return {boolean}
		 */
		isWhiteNote: function(noteValue) { 
			return this.noteValues.indexOf(noteValue) !== -1;
		},

		/**
		 * Returns the octave for a note number.
		 *
		 * @param {integer} noteNumber The midi note number.
		 * @return {integer}
		 */
		octaveOf: function(noteNumber) {
			return Math.floor(noteNumber / 12) - 1;
		},

		/**
		 * Returns an array of strings representing white and black notes. 
		 *
		 * @param {string} noteValue The current note value.
		 * @param {integer} size The keyboard size.
		 * @return {array}
		 */
		noteSequence: function(noteValue, size) {
			var nextNote = this.nextNote(noteValue);
			if(size === 0) {
				return [];
			} else if(size > 1 && this.blackNotesAfter.indexOf(noteValue) !== -1) {
				return [noteValue, this.blackNote].concat(this.noteSequence(nextNote, size - 2));
			} 
			return [noteValue].concat(this.noteSequence(nextNote, size - 1));
		},

		/**
		 * Returns an array of piano key string values.
		 *
		 * @param {integer} size The keyboard size.
		 * @return {array}
		 */
		generate: function(size) {
			return this.noteSequence(this.firstNote(size), size);
		},

		/**
		 * Returns an array of note objects with note names and numbers.
		 *
		 * @param {integer} size The keyboard size.
		 * @return {array}
		 */
		generateNotes: function(size) {
			var noteAsObject = _.bind(this.noteAsObject(size), this);
			return _.map(this.generate(size), noteAsObject);
		},

		/**
		 * Returns a function for converting a note value to an object.
		 *
		 * @param {integer} size The keyboard size.
		 * @return {function}
		 */
		noteAsObject: function(size) {
			var firstNoteNumber = this.firstNoteNumber(size);	

			return function(noteValue, index) {
				var noteNumber = firstNoteNumber + index;
				var octave = this.octaveOf(noteNumber);
				var isWhite = this.isWhiteNote(noteValue);
				var noteName = (isWhite ? noteValue + octave : '');

				return { 
					'noteName': noteName,
					'noteNumber': noteNumber,
				    'isWhite': isWhite
				};
			};
		}
	};

	return PianoKeyGenerator;
});
