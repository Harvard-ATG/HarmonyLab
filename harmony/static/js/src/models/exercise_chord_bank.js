define([
	'lodash',
	'microevent',
	'./chord',
	'./chord_bank'
], function(
	_,
	MicroEvent,
	Chord,
	ChordBank
) {

	var ExerciseChordBank = function(settings) {
		ChordBank.call(this, settings);
		this._currentIndex = 0;
		this._enableBanking = false;
	};

	ExerciseChordBank.prototype = new ChordBank();

	var proto = ExerciseChordBank.prototype;
	proto.init = function() {
		ChordBank.prototype.init.call(this);
	};

	proto.current = function() {
		return this._items[this._currentIndex];
	};

	// Override superclass method to be a no-op
	proto.bank = function() {};

	// Go to a chord in the bank. Create one at that location if necessary.
	proto.goTo = function(index) {
		var current;
		if(index < 0 || index === this._currentIndex) {
			return this;
		}

		current = this.current();
		if(current) {
			this._removeListeners(current);
		}

		if(!this._items[index]) {
			this._items.splice(index, 1, new Chord());
		}
		this._addListeners(this._items[index]);
		this._currentIndex = index;

		return this;
	}

	return ExerciseChordBank;
});
