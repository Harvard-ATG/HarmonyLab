/**
 * @fileoverview Piano metronome control UI.
 */
define([
	'lodash',
	'jquery',
	'microevent',
	'app/model/metronome',
	'app/util',
], function(
	_, 
	$, 
	MicroEvent,
	Metronome,
	util
) {
	"use strict";

	/**
	 * Creates an instance of a PianoMetronome.
	 *
	 * This is a UI control used to manipulate the metronome, which will play a
	 * "tick" sound when it is started. This object is primarily responsible
	 * fore rendering the view and responding to user input. It delegates control 
	 * for operating the metronome to the Metronome model.
	 *
	 * @constructor
	 * @fires change
	 * @fires onbeat
	 * @fires offbeat
	 * @mixes MicroEvent
	 */
	var PianoMetronome = function() {
		/**
		 * The DOM element encapsulating this view.
		 * @type {object}
		 */
		this.el = null;
		/**
		 * Audio element.
		 * @type {Audio}
		 */
		this.audio = null;
		/**
		 * Metronome model object.
		 * @type {Metronome}
		 */
		this.metronome = null;
		/**
		 * Flag to indicate if the element was rendered.
		 * @type {boolean}
		 */
		this.rendered = false;

		this.init();
	};

	_.extend(PianoMetronome.prototype, {
		/**
		 * Template that defines the metronome UI. 
		 * @type {function}
		 */
		tpl: _.template([
			'<div class="metronome-control">',
				'<div style="float:right" class="metronome-icon js-metronome-btn"></div>',
				'<input style="float:right" name="bpm" type="text" class="metronome-control-input js-metronome-input" value="" maxlength="3" />',
				'<div style="float:right" class="metronome-led js-metronome-led"></div>',
			'</div>'
		].join('')),
		/**
		 * DOM selectors used to manipulate the UI.
		 * @type {object}
		 */
		selectors: {
			inputEl: '.js-metronome-input',
			btnEl: '.js-metronome-btn',
			ledEl: '.js-metronome-led',
		},
		/**
		 * CSS classes used to manipulate the UI. 
		 * @type {object}
		 */
		cssCls: {
			ledActive: 'metronome-led-on',
			btnActive: 'metronome-icon-active'
		},

		/**
		 * Defines the audio sources used to play the "tick" sound.
		 * @type {array}
		 */
		audioSources: [
			util.staticUrl('audio/metronome.mp3'),
			util.staticUrl('audio/metronome.ogg')
		],
		/**
		 * Initializes the object.
		 *
		 * @return undefined
		 */
		init: function() {
			this.metronome = new Metronome();
			this.audio = util.createAudio(this.audioSources);

			_.bindAll(this, ['play','blink','toggle','onChangeTempo']);
		},
		/**
		 * Initializes the listeners.
		 *
		 * Note: called after rendering.
		 *
		 * @return undefined
		 */
		initListeners: function() {
			this.metronome.bind('tick', this.play);
			this.metronome.bind('tick', this.blink);
			this.btnEl.on('click', this.toggle);
			this.inputEl.on('change', this.onChangeTempo);
		},
		/**
		 * Renders the ui.
		 *
		 * @return undefined
		 */
		render: function() {
			if(!this.rendered) {
				this.el = $(this.tpl());
				this.inputEl = $(this.selectors.inputEl, this.el);
				this.ledEl = $(this.selectors.ledEl, this.el);
				this.btnEl = $(this.selectors.btnEl, this.el);
				this.initListeners();
				this.rendered = true;
			}
			return this;
		},
		/**
		 * Loads the audio when the browser is safari.
		 *
		 * This is called from the play() method.
		 *
		 * This is necessary because if load isn't called before each play(),
		 * then the sound will only be played once.
		 *
		 * @return undefined
		 */
		loadAudioWhenSafari: function() {
			var user_agent = window.navigator.userAgent;
			if(user_agent.indexOf('Chrome') === -1 
				&& user_agent.indexOf('Safari') > -1) {
				this.audio.load(); 
			} 
		},
		/**
		 * Plays the audio tick sound.
		 *
		 * @return undefined
		 */
		play: function() {
			this.loadAudioWhenSafari();
			this.audio.play();
		},
		/**
		 * Blinks the metronome LED on/off.
		 *
		 * @fires onbeat
		 * @fires offbeat
		 * @return undefined
		 */
		blink: function() {
			this.ledEl.toggleClass(this.cssCls.ledActive);
			if(this.ledEl.hasClass(this.cssCls.ledActive)) {
				this.trigger("onbeat");
			} else {
				this.trigger("offbeat");
			}
		},
		/**
		 * Toggles the metronome.
		 *
		 * @fires change
		 * @return undefined
		 */
		toggle: function() {
			if(this.metronome.isPlaying()) {
				this.metronome.stop();
				this.btnEl.removeClass(this.cssCls.btnActive);
				this.ledEl.removeClass(this.cssCls.ledActive);
			} else {
				this.metronome.start();
				this.btnEl.addClass(this.cssCls.btnActive);
				this.inputEl.val(this.metronome.getTempo());
			}

			this.trigger("change");
		},
		/**
		 * Handles a change tempo event.
		 *
		 * @param ev
		 * @return undefined
		 */
		onChangeTempo: function(ev) {
			var tempo = parseInt($(ev.target).val(), 10);
			if(this.metronome.changeTempo(tempo)) {
				this.trigger("change");
			}
		},
		/**
		 * Returns the metronome model object.
		 *
		 * @return {Metronome}
		 */
		getMetronome: function() {
			return this.metronome;
		},
	});

	MicroEvent.mixin(PianoMetronome);

	return PianoMetronome;
});
