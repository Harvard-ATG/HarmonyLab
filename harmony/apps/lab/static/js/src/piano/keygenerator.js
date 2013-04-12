define(['lodash'], function(_) {

	/**
	 * The KeyGenerator object is responsible for knowing how to generate a
	 * sequence of keys for different piano keyboard sizes. It does not store
	 * any state on its own and is intended to be used by other objects as a
	 * factory.
	 */
	var KeyGenerator = {

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
			25: { 'firstNote': 'C' }, 
			37: { 'firstNote': 'C' }, 
			49: { 'firstNote': 'C' }, 
			61: { 'firstNote': 'C' }, 
			76: { 'firstNote': 'E' }, 
			88: { 'firstNote': 'A' }
		},

		/**
		 * Returns a string representing the first note on the keyboard. 
		 * Note that this depends on the keyboard size.
		 *
		 * @param {integer} size The keyboard size.
		 * @return {string} 
		 */
		firstNote: function(size) {
			if(!this.keyboardSizes.hasOwnProperty(size)) {
				throw new Error("Unknown first note for keyboard size.");
			}
			return this.keyboardSizes[size]['firstNote'];
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
		 * Returns an array of strings representing white and black notes. 
		 *
		 * @param {string} noteValue The current note value.
		 * @param {integer} size The keyboard size.
		 * @return {array}
		 */
		noteSequence: function(noteValue, size) {
			var nextNote = this.nextNote(noteValue);
			if(size == 0) {
				return [];
			} else if(size > 1 && this.blackNotesAfter.indexOf(noteValue) !== -1) {
				return [noteValue, this.blackNote].concat(this.noteSequence(nextNote, size - 2));
			} 
			return [noteValue].concat(this.noteSequence(nextNote, size - 1));
		},

		/**
		 * Returns an array of piano key objects.
		 * @param {integer} size The keyboard size.
		 * @return {array}
		 */
		generate: function(size) {
			return this.noteSequence(this.firstNote(size), size);
		}
	};

	return KeyGenerator;
});
