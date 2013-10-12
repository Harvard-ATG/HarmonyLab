/**
 * @fileoverview Defines the chord bank class.
 */
define([
	'lodash', 
	'microevent',
	'app/model/chord'
], function(
	_, 
	MicroEvent, 
	Chord
) {
	"use strict";

	/**
	 * Creates an instance of a chord bank.
	 *
	 * A chord bank is a collection of chords.  The purpose of the chord bank is
	 * to maintain a history of chords that have been played and relay events
	 * that bubble up from the currently active chord. It should know how to
	 * "bank" the current chord and add it to the history and know how to create
	 * a new chord.
	 *
	 * The current chord is the one that is being manipulated by MIDI NOTE
	 * ON/OFF events, while the banked chords are essentially read-only. The
	 * banked chords are primiarily of interest to the notation renderer which
	 * is responsible for rendering all or part of the chord bank and analyzing
	 * its contents.
	 *
	 * Change events from the current chord are relayed to any listeners on the
	 * chord bank itself. When a chord is banked, it also fires a bank event.
	 *
	 * @constructor
	 * @fires change
	 * @fires bank
	 */
	var ChordBank = function() {
		this.init();
	};

	_.extend(ChordBank.prototype, {
		/**
		 * Initializes the object
		 *
		 * @return 
		 */
		init: function() {
			var chord = new Chord();

			_.bindAll(this, ['onChangeCurrent']);

			this._addListeners(chord);

			this._limit = 10; // limit number of chords in the bank
			this._items = [chord];
		},
		/**
		 * Banks the current chord and generates a new chord that becomes the
		 * active chord.
		 *
		 * @fires bank
		 * @return
		 */
		bank: function() {
			var chord = new Chord();
			var current = this.current();
			chord.copyTranspose(current);
			chord.copySustain(current);

			// re-wire listeners because we only care about changes to the current chord
			this._removeListeners(current);
			this._addListeners(chord);
			this._add(chord);

			this.trigger('bank');
		},
		/**
		 * Returns a list of chords in the chord bank.
		 *
		 * @param {object} config
		 * @param {number} config.limit Will return items up to the limit.
		 * @param {boolean} config.reverse Will reverse the order of items after
		 * retrieving them up to the limit.
		 * @return
		 */
		items: function(config) {
			config = config || {};
			var items = this._items;
			if(config.limit) {
				items = this._items.slice(0, config.limit);
			}
			if(config.reverse) {
				items.reverse();
			}
			return items;
		},
		/**
		 * Returns the total number of items in the chord bank..
		 *
		 * @return {number} 
		 */
		size: function() {
			return this._items.length;
		},
		/**
		 * Clears the chord bank.
		 *
		 * @return
		 */
		clear: function() {
			if(this.current()) {
				this._removeListeners(this.current());
			}
			this._resetItems();
		},
		/**
		 * Returns the currently active chord.
		 *
		 * @return {Chord}
		 */
		current: function() {
			return this._items[0];
		},
		/**
		 * Handles change events from the currently active chord
		 * and relays them to the chord bank. 
		 *
		 * Listeners who want to be notified when the active chord changes
		 * should listen to the chord bank, *not* the active chord itself.
		 *
		 * @return
		 */
		onChangeCurrent: function() {
			var args = Array.prototype.slice.call(arguments, 0);
			args.unshift("change");
			this.trigger.apply(this, args);
		},

		//--------------------------------------------------

		/**
		 * Adds a chord to the bank.
		 *
		 * @private
		 */
		_add: function(chord) {
			if(this._limit !== null && this._items.length > this._limit) {
				this._items.pop();
			}
			this._items.unshift(chord);
		},
		/**
		 * Adds listeners to the chord.
		 * Used to setup the active chord.
		 *
		 * @private
		 * @param chord
		 * @return
		 */
		_addListeners: function(chord) {
			chord.bind('change', this.onChangeCurrent);
		},
		/**
		 * Removes listeners from a chord.
		 * Used when banking the active chord.
		 *
		 * @private
		 * @param chord
		 * @return
		 */
		_removeListeners: function(chord) {
			chord.unbind('change', this.onChangeCurrent);
		},
		/**
		 * Resets the items.
		 * Used when clearing the bank.
		 *
		 * @private
		 * @return
		 */
		_resetItems: function() {
			this._items = [];
		}
	});

	/**
	 * The chord bank is observable.
	 */
	MicroEvent.mixin(ChordBank); 
	
	return ChordBank;
});
