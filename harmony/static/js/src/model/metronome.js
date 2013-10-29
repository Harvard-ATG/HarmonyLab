define([
	'jquery',
	'lodash',
	'microevent',
	'app/config'
], function(
	$, 
	_, 
	MicroEvent,
	Config
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
	var MAX_TEMPO = Config.get('general.metronomeSettings.maxTempo');
	/**
	 * Defines the default tempo.
	 * @type {number}
	 * @const
	 */
	var DEFAULT_TEMPO = Config.get('general.metronomeSettings.defaultTempo');
	/**
	 * Defines the fraction of the tempo after which a tock occurs.
	 * @type {number}
	 * @const
	 */
	var DEFAULT_TOCK_DELAY_FRACTION = 0;

	/**
	 * Creates an instance of a metronome. 
	 *
	 * A metronome fires "tick" and "tock" events. Ticks occur at regular
	 * intervals defined by the tempo (beats per minute) that are given to the
	 * metronome object. Tocks are like ticks in that they occur at regular
	 * intervals _after_ each tick. The delay between the "tick" and "tock" is
	 * some fraction of the tick interval.
	 *
	 * @constructor
	 * @param {number} tempo The tempo.
	 * @mixes MicroEvent
	 * @fires tick
	 * @fires tock
	 * @fires change
	 */
	var Metronome = function(tempo, tockDelayFraction) {
		this.init(tempo, tockDelayFraction);
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
		init: function(tempo, tockDelayFraction) {
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
			 * The delay after a "tick," expressed as a fraction, at which a
			 * "tock" will occur.
			 * @type {number}
			 * @protected
			 */
			if(typeof tockDelayFraction === 'undefined') {
				this.tockDelayFraction = DEFAULT_TOCK_DELAY_FRACTION;
			} else if(tockDelayFraction >= 0 && tockDelayFraction < 1) {
				this.tockDelayFraction = tockDelayFraction;
			} else {
				throw new Error("invalid tock fraction");
			}

			/**
			 * The delay between each tick of the metronome expressed in
			 * milliseconds. This value depends on the tempo.
			 * @type {number}
			 * @protected
			 */
			this.tickDelay = this.calculateTickDelay(this.tempo);
			/**
			 * The delay between each tock of the metronome expressed in
			 * milliseconds. This value is some fraction of the tempo.
			 * @type {number}
			 * @protected
			 */
			this.tockDelay = this.calculateTockDelay(this.tempo, this.tockDelayFraction);
			/**
			 * The ID associated with the tick interval.
			 * @type {number}
			 */
			this.tickIntervalID = null;
			/**
			 * The ID associated with the tock interval.
			 * @type {number}
			 */
			this.tockIntervalID = null;
			/**
			 * The ID associated with the tock timer, which waits a certain
			 * amount of time after the first tick to start the tock interval.
			 * @type {number}
			 */
			this.tockTimeoutID = null;
			/**
			 * Repeat flag. When true, metronome is .
			 * @type {boolean}
			 * @protected
			 */
			this.running = false;

			_.bindAll(this, ['tick', 'tock', '_startTockInterval']);
		},
		/**
		 * Plays the tick.
		 *
		 * @return undefined
		 * @fires tick
		 */
		tick: function() {
			this.trigger("tick");
			if(this.tockDelay > 0) {
				this._scheduleTockInterval();
			} else {
				this.tock();
			}
		},
		/**
		 * Plays the tock.
		 *
		 * @return undefined
		 * @fires tock
		 */
		tock: function() {
			this.trigger("tock");
		},
		/**
		 * Starts the metronome.
		 *
		 * @return undefined
		 * @fires change
		 */
		start: function() {
			this.running = true;
			this._startTickInterval();
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
			this._clearIntervals();
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
				this.tickDelay = this.calculateTickDelay(tempo);
				this.tockDelay = this.calculateTockDelay(tempo, this.tockDelayFraction);
				this._updateIntervals();
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
			return this.tickDelay;
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
		calculateTickDelay: function(tempo) {
			return Math.floor(MS_PER_MIN / tempo);
		},
		/**
		 * Given beats per minute and a fraction, returns the number of
		 * milliseconds .
		 *
		 * @param {number} tempo Tempo in bpm
		 * @param {number} fraction Fraction of the tempo
		 * @return {number}
		 */
		calculateTockDelay: function(tempo, fraction) {
			return (fraction * this.calculateTickDelay(tempo));
		},
		/**
		 * Updates the interval when the metronome is playing.
		 *
		 * @return
		 * @private
		 */
		_updateIntervals: function() {
			if(this.isPlaying()) {
				this._clearIntervals();
				this._startTickInterval();
			}
		},
		/**
		 * Initializes the interval between ticks of the metronome.
		 * 
		 * @return undefined
		 * @private
		 */
		_startTickInterval: function() {
			this.tickIntervalID = window.setInterval(this.tick, this.tickDelay);
		},
		/**
		 * Initializes the interval between tocks of the metronome, which
		 * is the same interval as ticks.
		 *
		 * @return undefined
		 * @private
		 */
		_startTockInterval: function() {
			this.tockIntervalID = window.setInterval(this.tock, this.tickDelay);
		},
		/**
		 * Schedules the start of the tock interval.
		 *
		 * @return undefined
		 * @private
		 */
		_scheduleTockInterval: function() {
			if(this.tockIntervalID === null) {
				this.tockTimeoutID = window.setTimeout(this._startTockInterval, this.tockDelay);
			}
		},
		/**
		 * Unsets the intervals.
		 *
		 * @return undefined
		 * @private
		 */
		_clearIntervals: function() {
			if(this.tockTimeoutID !== null) {
				window.clearTimeout(this.tockTimeoutID);
				this.tockTimeoutID = null;
			}
			if(this.tickIntervalID !== null) {
				window.clearInterval(this.tickIntervalID);
				this.tickIntervalID = null;
			}
			if(this.tockIntervalID !== null) {
				window.clearInterval(this.tockIntervalID);
				this.tockIntervalID = null;
			}
		}
	});

	MicroEvent.mixin(Metronome);

	return Metronome;
});
