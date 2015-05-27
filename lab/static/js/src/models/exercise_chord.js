define([
	'lodash',
	'./chord'
], function(
	_,
	Chord
) {

	var ExerciseChord = function(settings) {
		Chord.call(this, settings);
	};

	ExerciseChord.prototype = new Chord();

	var proto = ExerciseChord.prototype;
	proto.init = function() {
		Chord.prototype.init.call(this);
	};
	proto.grade = function(notes, correctness) {
		correctness = correctness ? true : false;
		this.setNoteProps(notes, {
			correctness: correctness
		});
		return this;
	};
	proto.getNotesWithCorrectness = function(clef) {
		return this.mapNotes(clef, function(noteNum) {
			var result = {
				noteNum: noteNum,
				correctness: this._noteProps[noteNum].correctntess,
				pitchClass: (noteNum % 12),
				octave: (Math.floor(noteNum / 12) - 1)
			};
			return result;
		});
	};

	return ExerciseChord;
});
