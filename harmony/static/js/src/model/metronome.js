define([
	'jquery',
	'lodash',
	'microevent'
], function(
	$, 
	_, 
	MicroEvent
) {
	"use strict";

	/**
	 * Number of milliseconds per minute.
	 * @type {number}
	 * @const
	 */
	var MS_PER_MIN = 60 * 1000;
	/**
	 * Minimum tempo.
	 * @type {number}
	 * @const
	 */
	var MIN_TEMPO = 1;
	/**
	 * Maximum tempo.
	 * @type {number}
	 * @const
	 */
	var MAX_TEMPO = 600;
	/**
	 * Defines the default tempo.
	 * @type {number}
	 * @const
	 */
	var DEFAULT_TEMPO = 90;

	/**
	 * Creates an instance of a metronome. 
	 *
	 * @constructor
	 * @param {number} tempo The tempo.
	 * @mixes MicroEvent
	 * @fires tick
	 * @fires change
	 */
	var Metronome = function(tempo) {
		this.init(tempo);
	};

	/**
	 * Make constants public (for test purposes). 
	 */
	_.extend(Metronome, {
		MIN_TEMPO: MIN_TEMPO,
		MAX_TEMPO: MAX_TEMPO,
		DEFAULT_TEMPO: DEFAULT_TEMPO
	});

	_.extend(Metronome.prototype, {
		/**
		 * Initializes the metronome.
		 *
		 * @param {number} tempo
		 * @return undefined
		 */
		init: function(tempo) {
			/**
			 * Tempo expressed in beats per minute (bpm).
			 * @type {number}
			 * @protected
			 */
			if(typeof tempo === 'undefined') {
				this.tempo = DEFAULT_TEMPO;
			} else if(this.isValidTempo(tempo)) {
				this.tempo = tempo;
			} else {
				throw new Error("invalid tempo");
			}

			/**
			 * The delay between each tick of the metronome expressed in
			 * milliseconds. This value depends on the tempo.
			 * @type {number}
			 * @protected
			 */
			this.delay = this.calculateDelay(this.tempo);
			/**
			 * Repeat flag. When true, metronome is running.
			 * @type {boolean}
			 * @protected
			 */
			this.running = false;
			/**
			 * The ID associated with setTimeout() for scheduling ticks.
			 * @type {number}
			 */
			this.intervalID = null;

			_.bindAll(this, ['play']);
		},
		/**
		 * Plays the tick and runnings.
		 *
		 * @return undefined
		 * @fires tick
		 */
		play: function() {
			this.trigger("tick");
		},
		/**
		 * Starts the metronome.
		 *
		 * @return undefined
		 * @fires change
		 */
		start: function() {
			this.running = true;
			this._setInterval();
			this.trigger("change");
		},
		/**
		 * Stops the metronome
		 *
		 * @return
		 * @fires change
		 */
		stop: function() {
			this.running = false;
			this._clearInterval();
			this.trigger("change");
		},
		/**
		 * Returns true if the metronome is playing, false otherwise.
		 *
		 * @return {boolean}
		 */
		isPlaying: function() {
			return this.running;
		},
		/**
		 * Changes the current tempo. 
		 *
		 * @param {number} tempo Tempo in beats per minute.
		 * @return {boolean} True if the tempo was changed, false otherwise.
		 * @fires change
		 */
		changeTempo: function(tempo) {
			if(this.isValidTempo(tempo)) {
				this.tempo = tempo;
				this.delay = this.calculateDelay(tempo);
				this._updateInterval();
				this.trigger("change");
				return true;
			}
			return false;
		},
		/**
		 * Returns the current tempo.
		 *
		 * @return {number}
		 */
		getTempo: function() {
			return this.tempo;
		},
		/**
		 * Returns the delay in milliseconds between each "tick" of the
		 * metronome.
		 *
		 * @return {number}
		 */
		getDelay: function() {
			return this.delay;
		},
		/**
		 * Returns true if the tempo is valid, false otherwise.
		 *
		 * @param {number} tempo
		 * @return {boolean}
		 */
		isValidTempo: function(tempo) {
			return (/^\d+$/).test(tempo) && tempo >= MIN_TEMPO && tempo <= MAX_TEMPO;
		},
		/**
		 * Given beats per minute, returns the number of milliseconds.
		 *
		 * @param {number} tempo Tempo in beats per minute.
		 * @return {number}
		 */
		calculateDelay: function(tempo) {
			return Math.floor(MS_PER_MIN / tempo);
		},
		/**
		 * Updates the interval when the metronome is playing.
		 *
		 * @return
		 * @private
		 */
		_updateInterval: function() {
			if(this.isPlaying()) {
				this._clearInterval();
				this._setInterval();
			}
		},
		/**
		 * Initializes the interval between ticks of the metronome.
		 * 
		 * @return undefined
		 * @private
		 */
		_setInterval: function() {
			this.intervalID = window.setInterval(this.play, this.delay);
		},
		/**
		 * Unsets the tick intervals.
		 *
		 * @return undefined
		 * @private
		 */
		_clearInterval: function() {
			if(this.intervalID !== null) {
				window.clearInterval(this.intervalID);
			}
		}
	});

	MicroEvent.mixin(Metronome);

	return Metronome;
});
