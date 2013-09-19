/* global define: false */
define([
	'lodash', 
	'microevent',
	'app/model/chord'
], function(_, MicroEvent, Chord) {
	"use strict";

	// Collection of chords (i.e. a chord bank).
	//
	// Responsible for knowing the current chord and the rest that are in the
	// bank. The current chord is the one that is currently active or being
	// played. The rest may be accessed for later review, analysis, display,
	// etc.
	//
	// Events:
	// - Triggers a "change" event when the current chord changes.
	// - Triggers a "bank" event when the current chord is banked.
	//

	var ChordBank = function() {
		this.init();
	};

	_.extend(ChordBank.prototype, {
		// initializes the collection with a single chord
		init: function() {
			var chord = new Chord();

			_.bindAll(this, ['onChangeCurrent']);

			this._addListeners(chord);

			this._limit = 10; // limit number of chords in the bank
			this._items = [chord];
		},
		// banks the current chord and replaces it with a new one
		bank: function() {
			var chord = new Chord();

			// re-wire listeners because we only care about changes to the current chord
			this._removeListeners(this.current());
			this._addListeners(chord);
			this._add(chord);

			this.trigger('bank');

			return this;
		},
		// returns all items in the chord bank
		items: function() {
			return this._items;
		},
		// returns the first chord - aliased to current()
		first: function() {
			return this._items[0];
		},
		// returns the rest of the chords
		rest: function() {
			return this._items.slice(1);
		},
		// event handler that relays a change event from
		// a source object to this object
		onChangeCurrent: function() {
			var args = Array.prototype.slice.call(arguments, 0);
			args.unshift("change");
			this.trigger.apply(this, args);
		},

		//--------------------------------------------------
		// Private methods
		_add: function(chord) {
			if(this._limit !== null && this._items.length > this._limit) {
				this._items.pop();
			}
			this._items.unshift(chord);
			return this;
		},
		_addListeners: function(chord) {
			chord.bind('change', this.onChangeCurrent);
			return this;
		},
		_removeListeners: function(chord) {
			chord.unbind('change', this.onChangeCurrent);
			return this;
		}
	});

	// Alias
	ChordBank.prototype.current = ChordBank.prototype.first;

	MicroEvent.mixin(ChordBank); // make object observable
	
	return ChordBank;
});
