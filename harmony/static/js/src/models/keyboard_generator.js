define(['lodash'], function(_) {

	/**
	 * Models a keyboard generator that knows how to generate
	 * different sized keyboards. 
	 *
	 * @constructor
	 */
	var KeyboardGenerator = function(size) {
		this.keySpecs = this.generate(size);
	};

	// Defines: keys that are white (true), or black (false) modulo 12
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

	// Maps: keyboard size => starting midi note number
	KeyboardGenerator.startingNoteForSize = {
		25: 48,
		37: 48,
		49: 36,
		61: 36,
		88: 21
	};

	// Given the size of the piano, this function returns the initial note number 
	// that begins the sequence of keys.
	KeyboardGenerator.prototype.startingNote = function(size) {
		if(!(size in KeyboardGenerator.startingNoteForSize)) {
			throw new Error("invalid keygen size: " + size);
		}
		return KeyboardGenerator.startingNoteForSize[size];
	};

	// Returns an array of spec objects that define the sequence of keys
	// on the piano for a given size.
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

	KeyboardGenerator.prototype.numWhiteKeys = function() {
		return _.filter(_.pluck(this.keySpecs, 'isWhite')).length;
	};

	return KeyboardGenerator;
});
