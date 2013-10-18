/**
 * @fileoverview Defines the chord bank class.
 */
define([
	'lodash', 
	'microevent',
	'app/model/chord',
	'app/util'
], function(
	_, 
	MicroEvent, 
	Chord,
	util
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
	 * Change and clear events from the current chord are relayed to any listeners on the
	 * chord bank itself. When a chord is banked, it also fires a bank event.
	 *
	 * @constructor
	 * @mixes MicroEvent
	 * @fires change
	 * @fires bank
	 * @fires clear
	 */
	var ChordBank = function() {
		this.init();
	};

	_.extend(ChordBank.prototype, {
		/**
		 * Initializes the object
		 *
		 * @return undefined
		 */
		init: function() {
			var chord = new Chord();

			/**
			 * Holds a mapping of events to callback functions.
			 * Used to relay events from the active chord.
			 * @type {object}
			 * @protected
			 */
			this._relayEvents = {};
			/**
			 * Limit the number of chords that can be in the bank.
			 * @type {number}
			 * @protected
			 */
			this._limit = 10; // limit number of chords in the bank
			/**
			 * Contains the items in the bank.
			 * @type {array}
			 * @protected
			 */
			this._items = [chord];

			this._addListeners(chord);
		},
		/**
		 * Banks the current chord and generates a new chord that becomes the
		 * active chord.
		 *
		 * @fires bank
		 * @return undefined
		 */
		bank: function() {
			var chord = new Chord();
			var current = this.current();

			// copy some settings from the current chord
			chord.copyTranspose(current);

			// re-wires listeners to the current chord
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
		 * @return undefined
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
		 * @fires clear
		 * @return undefined
		 */
		clear: function() {
			this._resetItems();
			this.trigger("clear");
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
		 * Returns *all* distinct notes in the chord bank.
		 *
		 * @return {Array} An array of note numbers.
		 */
		getAllNotes: function() {
			var note_map = _.reduce(this._items, function(result, chord) {
				var i, len, note_num, note_nums = chord.getNoteNumbers();
				for(i = 0, len = note_nums.length; i < len; i++) {
					note_num = chord.untranspose(note_nums[i]);
					result[note_num] = true;
				}
				return result;
			}, {});

			var note_nums = _.keys(note_map);

			return note_nums;
		},
		/**
		 * Returns true if any chords in the bank are sustained.
		 *
		 * @return {boolean} True if any chords are sustained, false otherwise.
		 */
		anySustained: function() {
			return _.any(this._items, function(chord) {
				return chord.isSustained();
			});
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
		 * @return undefined
		 */
		_addListeners: function(chord) {
			this._relayEvents = util.relayEvents(['change','clear'], chord, this);
		},
		/**
		 * Removes listeners from a chord.
		 * Used when banking the active chord.
		 *
		 * @private
		 * @param chord
		 * @return undefined
		 */
		_removeListeners: function(chord) {
			util.unrelayEvents(this._relayEvents, chord);
			this._relayEvents = {};
		},
		/**
		 * Resets the items.
		 * Used when clearing the bank.
		 *
		 * @private
		 * @return undefined
		 */
		_resetItems: function() {
			var chord = new Chord();
			var current = this.current();
			if(current) {
				this._removeListeners(current);
				chord.copyTranspose(current);
				if(current.isSustained()) {
					chord.sustainNotes();
				}
			}
			this._addListeners(chord);
			this._items = [chord];
		}
	});

	MicroEvent.mixin(ChordBank);  // make observable
	
	return ChordBank;
});
