define(['lodash'], function(_) {

	/**
	 * KeyboardGenerator
	 *
	 * Models a keyboard generator that knows how to generate
	 * keyboards of different sizes. When a new instance is created
	 * it automatically generates the specifications for the given
	 * keyboard size.
	 *
	 * @param {number} size The size of the keyboard
	 * @constructor
	 */
	var KeyboardGenerator = function(size) {
		this.keySpecs = this.generate(size);
	};

	/**
	 * For each of the 12 keys in the octave [0-11], defines whether
	 * the key is white (true) or black (false).
	 *
	 * @property {object}
	 */
	KeyboardGenerator.keyIsWhite = {
		0: true,
		1: false,
		2: true,
		3: false,
		4: true,
		5: true,
		6: false,
		7: true,
		8: false,
		9: true,
		10: false,
		11: true
	};

	/**
	 * For each of supported keyboard sizes, defines the MIDI note
	 * number that should be assigned to the first key in the sequence.
	 *
	 * @property {object}
	 */
	KeyboardGenerator.startingNoteForSize = {
		25: 48,
		37: 48,
		49: 36,
		61: 36,
		88: 21
	};

	/**
	 * Given the size, returns the starting MIDI note for the sequence. 
	 *
	 * @param {number} size The size of the keyboard
	 * @return {number}
	 */
	KeyboardGenerator.prototype.startingNote = function(size) {
		var startingNoteForSize = KeyboardGenerator.startingNoteForSize;
		if(!(size in startingNoteForSize)) {
			throw new Error("invalid keyboard size: " + size + " must be one of " + _.keys(startingNoteForSize).join(', '));
		}
		return startingNoteForSize[size];
	};

	/**
	 * Generates a sequence of key specifications for each key
	 * in the keyboard.
	 *
	 * @param {number} size The size of the keyboard
	 * @return {array} 
	 */
	KeyboardGenerator.prototype.generate = function(size) {
		var noteNumber = this.startingNote(size);
		var keySpecs = [];
		var index;
		
		for(index = 0; index < size; index++, noteNumber++) {
			keySpecs.push({
				noteNumber: noteNumber,
				pitch: noteNumber % 12,
				isWhite: KeyboardGenerator.keyIsWhite[noteNumber % 12],
			});
		}

		return keySpecs;
	};

	/**
	 * Returns the total number of "white" keys in the keyboard.
	 *
	 * @return {number}
	 */
	KeyboardGenerator.prototype.getNumWhiteKeys = function() {
		return _.filter(_.pluck(this.keySpecs, 'isWhite')).length;
	};

	/**
	 * Returns the total number of keys in the keyboard.
	 *
	 * @return {number}
	 */
	KeyboardGenerator.prototype.getSize = function() {
		return this.keySpecs.length;
	};

	return KeyboardGenerator;
});
