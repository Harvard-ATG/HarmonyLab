define([
	'lodash',
	'microevent',
	'./chord_bank'
], function(
	_,
	MicroEvent,
	ChordBank
) {

	var ExerciseChordBank = function(settings) {
		ChordBank.call(this, settings);
	};

	ExerciseChordBank.prototype = new ChordBank();

	var proto = ExerciseChordBank.prototype;
	proto.init = function() {
		ChordBank.prototype.init.call(this);
	};

	return ExerciseChordBank;
});
