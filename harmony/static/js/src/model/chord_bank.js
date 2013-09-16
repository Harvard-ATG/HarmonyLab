/* global define: false */
define([
	'lodash', 
	'microevent',
	'app/model/chord'
], function(_, MicroEvent, Chord) {
	"use strict";

	// Collection of chords.
	//
	// Responsible for knowing how to "bank" chords (keep a history
	// of chords that can be reviewed, etc). 
	var ChordBank = function() {
		this.init();
	};

	_.extend(ChordBank.prototype, {
		// initializes the collection with a single chord
		init: function() {
			var chord = new Chord();

			_.bindAll(this, ['onChangeCurrent']);

			this._addListeners(chord);
			this._items = [chord];
		},
		// banks the current chord and replaces it with a new one
		bank: function() {
			var chord = new Chord();

			// re-wire listeners because we only care about changes to the current chord
			this._removeListeners(this.current());
			this._addListeners(chord);

			// add the new chord
			this._items.unshift(chord);

			return this;
		},
		// returns the first chord - aliased to current()
		first: function() {
			return this._items[0];
		},
		// returns the rest of the chords
		rest: function() {
			return this._items.slice(1);
		},
		// iterates over the chords
		eachBanked: function(callback) {
			_.each(this.rest(), callback);
			return this;
		},
		// maps over the chords
		mapBanked: function(callback) {
			return _.map(this.rest(), callback);
		},
		_addListeners: function(chord) {
			chord.bind('change', this.onChangeCurrent);
		},
		_removeListeners: function(chord) {
			chord.unbind('change', this.onChangeCurrent);
		},
		// event handler that just relays a change event by
		// triggering the same event on this object
		onChangeCurrent: function() {
			var args = Array.prototype.slice(arguments, 0);
			this.trigger.apply(this, args);
		}
	});

	// Alias
	ChordBank.prototype.current = ChordBank.prototype.first;

	MicroEvent.mixin(ChordBank); // make object observable
	
	return ChordBank;
});
