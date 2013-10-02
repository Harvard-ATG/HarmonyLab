define(['jquery','lodash'], function($, _) {
	"use strict";

	var MS_PER_MIN = 60 * 1000; // milliseconds per minute
	var MIN_TEMPO = 1;
	var MAX_TEMPO = 300;

	var Metronome = function(el, tempo) {
		this.init(el, tempo);
	};

	_.extend(Metronome.prototype, {
		// default tempo of the metronome, expressed in beats per minute (bpm)
		defaultTempo: 90, 

		// initializes the metronome
		init: function(el, tempo) {
			this.audio = el;
			this.tempo = this._isValidTempo(tempo) ? tempo : this.defaultTempo;
			this.delay = this._calculateDelay(this.tempo);
			this.repeat = false;
			this.timeoutID = null;

			_.bindAll(this, ['play']);
		},
		// plays the audio "tick" sound
		play: function() {
			this.audio.play();
			if(this.repeat) {
				this._scheduleNextPlay();
			}
		},
		// starts the metronome
		start: function() {
			this.repeat = true;
			this._scheduleNextPlay();
		},
		// stops the metronome
		stop: function() {
			this.repeat = false;
			this._unscheduleNextPlay();
		},
		// returns true if the metronome is playing, false otherwise
		isPlaying: function() {
			return this.repeat;
		},
		// changes the current tempo (expressed in beats per minute)
		changeTempo: function(tempo) {
			if(this._isValidTempo(tempo)) {
				this.tempo = tempo;
				this.delay = this._calculateDelay(tempo);
			}
		},
		_isValidTempo: function(tempo) {
			return /^\d+$/.test(tempo) && tempo >= MIN_TEMPO && tempo <= MAX_TEMPO;
		},
		_calculateDelay: function(beatsPerMinute) {
			return Math.floor(MS_PER_MIN / beatsPerMinute);
		},
		_scheduleNextPlay: function() {
			this.timeoutID = window.setTimeout(this.play, this.delay);
		},
		_unscheduleNextPlay: function() {
			if(this.timeoutID !== null) {
				window.clearTimeout(this.timeoutID);
			}
		}
	});

	return Metronome;
});
