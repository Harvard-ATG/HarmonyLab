define(['lodash', './key',], function(_, PianoKey) {

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
			88: { 'firstNote': 'A', 'firstNoteNumber': 9 }
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
		generateSequence: function(size) {
			return this.noteSequence(this.firstNote(size), size);
		},

		/**
		 * Returns an array of key objects. 
		 *
		 * @param {integer} size The keyboard size.
		 * @param {object} keyboard The keyboard.
		 * @return {array}
		 */
		generateKeys: function(size, keyboard) {
			var noteSequence = this.generateSequence(size);
			var noteKeyConverter = _.bind(this.noteKeyConverter(size, keyboard), this);
			return _.map(noteSequence, noteKeyConverter);
		},

		/**
		 * Returns a function for converting a note value to a key object.
		 *
		 * @param {integer} size The keyboard size.
		 * @return {function}
		 */
		noteKeyConverter: function(size, keyboard) {
			var firstNoteNumber = this.firstNoteNumber(size);

			return function(noteValue, index) {
				var noteNumber = firstNoteNumber + index;
				var isWhite = this.isWhiteNote(noteValue);
				var noteName = '';
				if(isWhite) {
					noteName = noteValue + this.octaveOf(noteNumber);
				}

				return PianoKey.create({ 
					'noteName': noteName,
					'noteNumber': noteNumber,
				    'isWhite': isWhite,
					'keyboard': keyboard
				});
			};
		}
	};

	return PianoKeyGenerator;
});
