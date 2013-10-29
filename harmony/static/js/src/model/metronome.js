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
	var DEFAULT_TOCK_FRACTION = 0;

	/**
	 * Creates an instance of a metronome. 
	 *
	 * @constructor
	 * @param {number} tempo The tempo.
	 * @mixes MicroEvent
	 * @fires tick
	 * @fires change
	 */
	var Metronome = function(tempo, tockFraction) {
		this.init(tempo, tockFraction);
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
		init: function(tempo, tockFraction) {
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
			 * Fraction of the tempo that will trigger a "tock" after the
			 * "tick."
			 *
			 * @return
			 */
			if(typeof tockFraction === 'undefined') {
				this.tockFraction = DEFAULT_TOCK_FRACTION;
			} else if(tockFraction >= 0 && tockFraction < 1) {
				this.tockFraction = tockFraction;
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
			this.tockDelay = this.calculateTockDelay(this.tempo, this.tockFraction);
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
			 * Repeat flag. When true, metronome is running.
			 * @type {boolean}
			 * @protected
			 */
			this.running = false;

			_.bindAll(this, ['tick', 'tock', 'ticktock']);
		},
		/**
		 * Plays the tick.
		 *
		 * @return undefined
		 * @fires tick
		 */
		tick: function() {
			this.trigger("tick");
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
		 * Plays the tick and the tock.
		 *
		 * @return undefined
		 */
		ticktock: function() {
			this.tick();
			this.tock();
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
				this.tickDelay = this.calculateTickDelay(tempo);
				this.tockDelay = this.calculateTockDelay(tempo, this.tockFraction);
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
			return (this.calculateTickDelay(tempo) * (1 + fraction));
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
			if(this.tickDelay === this.tockDelay) {
				this.tickIntervalID = window.setInterval(this.ticktock, this.tickDelay);
			} else {
				this.tickIntervalID = window.setInterval(this.tick, this.tickDelay);
				this.tockIntervalID = window.setInterval(this.tock, this.tockDelay);
			}
		},
		/**
		 * Unsets the tick intervals.
		 *
		 * @return undefined
		 * @private
		 */
		_clearInterval: function() {
			if(this.tickIntervalID !== null) {
				window.clearInterval(this.tickIntervalID);
			}
			if(this.tockIntervalID !== null) {
				window.clearInterval(this.tockIntervalID);
			}
		}
	});

	MicroEvent.mixin(Metronome);

	return Metronome;
});
