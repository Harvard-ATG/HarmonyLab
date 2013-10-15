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
	 * @param {Audio} el A reference to an audio element. 
	 * @param {number} tempo The tempo.
	 * @mixes MicroEvent
	 * @fires tick
	 */
	var Metronome = function(el, tempo) {
		this.init(el, tempo);
	};

	_.extend(Metronome.prototype, {
		/**
		 * Initializes the metronome.
		 *
		 * @param {Audio} el
		 * @param {number} tempo
		 * @return undefined
		 */
		init: function(el, tempo) {
			/**
			 * Audio element.
			 * @type {Audio}
			 * @protected
			 */
			this.audio = el;
			/**
			 * Tempo expressed in beats per minute (bpm).
			 * @type {number}
			 * @protected
			 */
			this.tempo = this.isValidTempo(tempo) ? tempo : DEFAULT_TEMPO;
			/**
			 * The delay between each tick of the metronome expressed in
			 * milliseconds. This value depends on the tempo.
			 * @type {number}
			 * @protected
			 */
			this.delay = this.calculateDelay(this.tempo);
			/**
			 * Repeat flag. When true, schedules the next tick of the metronome.
			 * @type {boolean}
			 * @protected
			 */
			this.repeat = false;
			this.timeoutID = null;

			_.bindAll(this, ['play']);
		},
		/**
		 * Plays the audio tick sound.
		 *
		 * @return undefined
		 * @fires tick
		 */
		play: function() {
			this.audio.play();
			if(this.repeat) {
				this._scheduleNextPlay();
			}
			this.trigger("tick");
		},
		/**
		 * Starts the metronome.
		 *
		 * @return undefined
		 */
		start: function() {
			this.repeat = true;
			this._scheduleNextPlay();
		},
		/**
		 * Stops the metronome
		 *
		 * @return
		 */
		stop: function() {
			this.repeat = false;
			this._unscheduleNextPlay();
		},
		/**
		 * Returns true if the metronome is playing, false otherwise.
		 *
		 * @return {boolean}
		 */
		isPlaying: function() {
			return this.repeat;
		},
		/**
		 * Changes the current tempo. 
		 *
		 * @param {number} tempo Tempo in beats per minute.
		 * @return {boolean} True if the tempo was changed, false otherwise.
		 */
		changeTempo: function(tempo) {
			if(this.isValidTempo(tempo)) {
				this.tempo = tempo;
				this.delay = this.calculateDelay(tempo);
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
		 * Schedules the next tick of the metronome.
		 * 
		 * @return undefined
		 * @private
		 */
		_scheduleNextPlay: function() {
			this.timeoutID = window.setTimeout(this.play, this.delay);
		},
		/**
		 * Unschedules the next tick of the metronome
		 *
		 * @return undefined
		 * @private
		 */
		_unscheduleNextPlay: function() {
			if(this.timeoutID !== null) {
				window.clearTimeout(this.timeoutID);
			}
		}
	});

	MicroEvent.mixin(Metronome);

	return Metronome;
});
