/* global define: false */ 
define([
	'lodash', 
	'microevent',
	'vexflow'
], function(
	_, 
	MicroEvent,
	Vex
) {
	"use strict";

	/**
	 * Creates an instance of a Stave.
	 *
	 * A stave represents the view of a single bar of a stave. A stave may be
	 * associated with either the treble or bass clef and this determines its
	 * vertical position. Since the treble and bass staves need to be aligned, a
	 * treble stave should know how to connect with a bass stave in order to
	 * keep their positions in sync.
	 *
	 * To visualize how the staves are intended to organized:
	 *
	 * Treble clef: [Stave][Stave][Stave][Stave]...
	 *                 |     |      |      |
	 * Connected:      |     |      |      |
	 *                 V     V      V      V
	 * Bass clef:   [Stave][Stave][Stave][Stave]
	 *
	 * This object collaborates closely with KeySignature, StaveNotater, and
	 * StaveNoteFactory. It delegates the responsibility to generate notes to
	 * the StaveNoteFactory and to notate/annotate the stave to the
	 * StaveNotater.
	 *
	 * @constructor
	 * @param {string} clef
	 * @param {object} position
	 */
	var Stave = function(clef, position) {
		/**
		 * The clef this stave is associated with (treble or bass).
		 * @type {string}
		 * @return
		 */
		this.clef = '';
		/**
		 * The starting X position of the stave.
		 * @type {number}
		 */
		this.start_x = 0;
		/**
		 * The starting Y position of the stave.
		 * @type {number}
		 */
		this.start_y = 0;
		/**
		 * The maximum width of the stave.
		 * @type {number}
		 */
		this.maxWidth = null;
		/**
		 * The position of the stave in a sequence of staves.
		 * @type {object}
		 */
		this.position = {index: 0, count: 0};
		/**
		 * True if the stave is considered "banked" or false if not.
		 * @type {boolean}
		 */
		this._isBanked = false;

		_.bindAll(this, ['onNotated']);

		this.init(clef, position);
	};

	_.extend(Stave.prototype, {
		/**
		 * The width of the first stave bar in a sequence of staves.
		 * This is a special case since the first stave should be reserved for
		 * displaying the clef symbol and key signature, but no notes.
		 * @type {number}
		 */
		firstBarWidth: 90,
		/**
		 * The default width of a stave.
		 * @type {number}
		 */
		defaultWidth: 120,
		/**
		 * The margins for the stave.
		 * Change right margin to reveal or hide right barline.
		 * @type {number}
		 */
		margin: {left: 15, right: 1},
		/**
		 * Initializes the Stave.
		 *
		 * @param {string} clef treble|bass
		 * @param {object} position 
		 * @return undefined
		 */
		init: function(clef, position) {
			if(!clef || !position) {
				throw new Error("missing stave clef or position");
			}
			if(!this.validatePosition(position)) {
				throw new Error("missing or invalid stave position");
			}

			this.clef = clef;
			this.position = position;
		},
		/**
		 * Validates the position of the stave.
		 *
		 * @param {object} position
		 * @param {object} position.index The index of the stave in a sequence.
		 * @param {object} position.count A count of the staves in the sequence.
		 * @param {object} position.maxCount The maximum number of staves that
		 * may be displayed.
		 * @return {boolean} True if the position is valid, false otherwise.
		 */
		validatePosition: function(position) {
			var numRe = /^\d+$/;

			if(!position.hasOwnProperty('index') ||
				!position.hasOwnProperty('count') ||
				!position.hasOwnProperty('maxCount') || 
				!numRe.test(position.index) || 
				!numRe.test(position.count) || 
				!numRe.test(position.maxCount)) {
				return false;
			}

			// ensure the maximum number of bars is nonzero
			// since we must display at least one stave bar
			if(position.maxCount === 0) {
				return false;
			}

			return true;
		},
		/**
		 * Prepares for rendering.
		 *
		 * @return this
		 */
		prepareForRender: function() {
			this.createStaveBar();
			this.createStaveVoice();
			return this;
		},
		/**
		 * Renders the stave.
		 *
		 * @return this
		 */
		render: function() {
			if(!this.isConnected()) {
				return;
			}
			this.prepareForRender();
			this.doConnected('prepareForRender');

			this.formatStaveVoices();

			this.drawStaveVoice();
			this.doConnected('drawStaveVoice');
			this.drawStaveBar();
			this.doConnected('drawStaveBar');

			this.renderStaveConnector();

			this.notate();
			this.doConnected('notate');

			return this;
		},
		/**
		 * Renders the connected stave (if any).
		 *
		 * @return this
		 */
		renderConnected: function() {
			return this.doConnected('render');
		},
		/**
		 * Renders the stave connector, the bar/brace that joins the treble and
		 * bass staff together.
		 *
		 * @return this
		 */
		renderStaveConnector: function() {
			if(this.isFirstBar()) {
				this.drawBeginStaveConnector();
			} else if(this.isLastBar()) {
				this.drawEndStaveConnector();
			}
			return this;
		},
		/**
		 * Draws a connector at the beginning of the stave.
		 *
		 * @return undefined
		 */
		drawBeginStaveConnector: function() {
			var SINGLE = Vex.Flow.StaveConnector.type.SINGLE;
			var BRACE = Vex.Flow.StaveConnector.type.BRACE;
			var staff1 = this.getStaveBar();
			var staff2 = this.connectedStave.getStaveBar();
			this.drawStaveConnector(staff1, staff2, SINGLE); 
			this.drawStaveConnector(staff1, staff2, BRACE); 
		},
		/**
		 * Draws a connector at the end of the stave.
		 *
		 * @return undefined
		 */
		drawEndStaveConnector: function() {
			var SINGLE = Vex.Flow.StaveConnector.type.SINGLE;
			var ctx = this.getContext();
			var next_x = this.start_x + this.width;
			var width = 3; // width of stave connector
			var staff1 = new Vex.Flow.Stave(next_x, this.getYForClef('treble'), width);
			var staff2 = new Vex.Flow.Stave(next_x, this.getYForClef('bass'), width);

			staff1.setContext(ctx);
			staff2.setContext(ctx);

			// this.drawStaveConnector(staff1, staff2, SINGLE);
		},
		/**
		 * Draws a stave connector between two staves.
		 *
		 * @param {Stave} staff1
		 * @param {Stave} staff2
		 * @param connectorType
		 * @return undefined
		 */
		drawStaveConnector: function(staff1, staff2, connectorType) {
			var ctx = this.getContext();
			var connector = new Vex.Flow.StaveConnector(staff1, staff2);
			connector.setContext(ctx).setType(connectorType).draw();
		},
		/**
		 * Creates the Vex.Flow.Stave.
		 *
		 * @return undefined
		 */
		createStaveBar: function() {
			var x = this.start_x;
			var y = this.start_y;
			var width = this.width;
			var staveBar = new Vex.Flow.Stave(x, y, width);
			staveBar.clef = this.clef;

			if(this.isFirstBar()) {
				staveBar.setBegBarType(Vex.Flow.Barline.type.SINGLE);
				staveBar.setEndBarType(Vex.Flow.Barline.type.NONE);
			} else if(this.isLastBar()) {
				staveBar.setBegBarType(Vex.Flow.Barline.type.NONE);
				staveBar.setEndBarType(Vex.Flow.Barline.type.SINGLE);
			} else {
				staveBar.setBegBarType(Vex.Flow.Barline.type.NONE);
				staveBar.setEndBarType(Vex.Flow.Barline.type.NONE);
			}

			staveBar.setContext(this.getContext());

			if(this.isFirstBar()) {
				staveBar.addClef(this.clef);
				staveBar.addKeySignature(this.keySignature.getVexKey());
			} 

			this.staveBar = staveBar;
		},
		/**
		 * Creates the Vex.Flow.Voice.
		 * This is where we add the notes.
		 *
		 * @return undefined
		 */
		createStaveVoice: function() {
			var voice, formatter, time;

			if(this.hasStaveNotes()) {
				time = Vex.Flow.TIME4_4;
				voice = new Vex.Flow.Voice(time);
				voice.addTickables(this.createStaveNotes());
			}
			this.staveVoice = voice;
		},
		/**
		 * Format the Vex.Flow.Voice.
		 *
		 * @return undefined
		 */
		formatStaveVoices: function() {
			var voices = [], voice, connectedVoice, formatter; 

			if(this.isConnected()) {
				connectedVoice = this.getConnected().getStaveVoice();
			}

			if(this.staveVoice) {
				voices.push(this.staveVoice);
			}
			if(connectedVoice) {
				voices.push(connectedVoice);
			}

			voice = voices[0];

			if(voices.length > 0) {
				formatter = new Vex.Flow.Formatter();
				formatter.joinVoices([voice]).formatToStave(voices, this.staveBar);
			}
		},
		/**
		 * Draws the Vex.Flow.Voice on the Stave.
		 *
		 * @return undefined
		 */
		drawStaveVoice: function() {
			if(this.staveVoice) {
				this.staveVoice.draw(this.getContext(), this.staveBar);
			}
		},
		/**
		 * Draws the Stave.
		 *
		 * @return undefined
		 */
		drawStaveBar: function() {
			var ctx = this.getContext();
			this.staveBar.draw(ctx);
		},
		/**
		 * Notates the Stave. Delegates this responsibility 
		 * to the StaveNotater.
		 *
		 * @return undefined
		 */
		notate: function() {
			if(this.notater) {
				this.notater.notate();
			}
		},
		/**
		 * Sets the starting X position.
		 *
		 * Note: executes this on the connected stave.
		 *
		 * @param {number} x
		 * @return undefined
		 */
		setStartX: function(x) {
			this.start_x = x;
			this.doConnected('setStartX', x);
		},
		/**
		 * Sets the maximum width of the stave.
		 *
		 * Note: executes this on the connected stave.
		 *
		 * @param {number} w
		 * @return undefined
		 */
		setMaxWidth: function(w) {
			this.maxWidth = w;
			this.doConnected('setMaxWidth', w);
		},
		/**
		 * Sets the width of the stave.
		 *
		 * Note: executes this on the connected stave.
		 *
		 * @param {number} w
		 * @return undefined
		 */
		setWidth: function(w) {
			this.width = w;
			this.doConnected('setWidth', w);
		},
		/**
		 * Sets the StaveNoteFactory used to generate the notes that are
		 * displayed on the stave.
		 *
		 * @param {StaveNoteFactory} noteFactory
		 * @return undefined
		 */
		setNoteFactory: function(noteFactory) {
			this.noteFactory = noteFactory;
		},
		/**
		 * Sets the notater used to notate the stave.
		 *
		 * @param {StaveNotater} notater
		 * @return undefined
		 */
		setNotater: function(notater) {
			this.notater = notater;
			if(this.notater) {
				this.notater.bind("notated", this.onNotated);
			}
		},
		/**
		 * Connects this stave to another.
		 *
		 * There are some methods on the stave that automatically delegate to
		 * the stave they are connected to, particularly with regard to layout
		 * and sizing.
		 *
		 * @param {Stave} stave
		 * @return undefined
		 */
		connect: function(stave) {
			this.connectedStave = stave;
		},
		/**
		 * Returns true if this stave is connected to another, false otherwise.
		 *
		 * @return {boolean}
		 */
		isConnected: function() {
			return this.connectedStave ? true : false;
		},
		/**
		 * Executes a method on the connected stave.
		 *
		 * @param {string} method
		 * @return {mixed} Will return undefined if not connected, otherwise it
		 * returns the value of the executed method.
		 */
		doConnected: function(method) {
			var args = Array.prototype.slice.call(arguments, 1);
			if(this.isConnected()) {
				return this.connectedStave[method].apply(this.connectedStave, args);
			}
			return;
		},
		/**
		 * Returns the connected stave.
		 *
		 * @return {Stave}
		 */
		getConnected: function() {
			return this.connectedStave;
		},
		/**
		 * Returns the width of the stave.
		 *
		 * @return {number}
		 */
		getWidth: function() {
			return this.width;
		},
		/**
		 * Returns the height of the stave.
		 *
		 * @return {number}
		 */
		getHeight: function() {
			return this.height;
		},
		/**
		 * Returns the underlying Vex.Flow.Stave object.
		 *
		 * @return {object}
		 */
		getStaveBar: function() {
			return this.staveBar;
		},
		/**
		 * Returns the underlying Vex.Flow.Voice object.
		 *
		 * @return {object}
		 */
		getStaveVoice: function() {
			return this.staveVoice;
		},
		/**
		 * Returns the clef associated with the stave.
		 *
		 * @return {string}
		 */
		getClef: function() {
			return this.clef;
		},
		/**
		 * Returns the starting X position.
		 *
		 * @return
		 */
		getStartX: function() {
			return this.start_x;
		},
		/**
		 * Returns the top Y position of the stave.
		 *
		 * @return {number}
		 */
		getTopY: function() {
			return this.staveBar.getYForTopText();
		},
		/**
		 * Returns the bottom Y position of the stave.
		 *
		 * @return {number}
		 */
		getBottomY: function() {
			return this.staveBar.getBottomY();
		},
		/**
		 * Returns the canvas rendering context used by the Vex.Flow renderer.
		 *
		 * @return
		 */
		getContext: function() {
			return this.vexRenderer.getContext();
		},
		/**
		 * Creates stave notes to display on the stave. Delegates this
		 * responsibility to the StaveNoteFactory.
		 *
		 * @return {array}
		 */
		createStaveNotes: function() {
			if(this.noteFactory) {
				return this.noteFactory.createStaveNotes();
			}
			return [];
		},
		/**
		 * Returns true if the stave has any notes, false otherwise.
		 *
		 * @return {boolean}
		 */
		hasStaveNotes: function() {
			if(this.noteFactory) {
				return this.noteFactory.hasStaveNotes();
			}
			return false;
		},
		/**
		 * Sets the key signature for the stave.
		 *
		 * @param {KeySignature} keySignature
		 * @return undefined
		 */
		setKeySignature: function(keySignature) {
			this.keySignature = keySignature;
		},
		/**
		 * Sets the Vex.Flow renderer.
		 *
		 * @param renderer
		 * @return undefined
		 */
		setRenderer: function(renderer) {
			this.vexRenderer = renderer;
		},
		/**
		 * Updates the position of the stave. 
		 *
		 * This will have the side effect of modifying  the starting X and Y
		 * positions as well as the width of the stave.
		 *
		 * @return undefined
		 */
		updatePosition: function() {
			var start_x, width;

			if(this.isFirstBar()) {
				this.start_x = this.margin.left;
				this.width = this.firstBarWidth;
			} else {
				start_x = (this.margin.left + this.firstBarWidth);
				width = Math.floor((this.maxWidth - start_x) / this.position.maxCount);
				start_x += ((this.position.index - 1) * width);

				this.start_x = start_x;

				if(this.isLastBar()) {
					// stretch to fill remaining area
					this.width = this.maxWidth - this.start_x - this.margin.right;
				} else {
					this.width = width;
				}
			}

			this.start_y = this.getYForClef(this.clef);
		},
		/**
		 * Returns the vertical Y position associated with the given clef.
		 *
		 * @param {string} clef treble|bass
		 * @return {number}
		 */
		getYForClef: function(clef) {
			/**
			 * Adjust vertical spacing here.
			 */
			return (clef === 'treble' ? 0 : 80) + 55;
		},
		/**
		 * Returns true if this stave is the first bar in the sequence, false
		 * otherwise.
		 *
		 * @return {boolean}
		 */
		isFirstBar: function() {
			return this.position.index === 0;
		},
		/**
		 * Returns true if this stave is the last bar in the sequence, false
		 * otherwise.
		 *
		 * @return {boolean}
		 */
		isLastBar: function() {
			return this.position.index === this.position.count;
		},
		/**
		 * Sets the status of this stave as "banked" or not.
		 *
		 * @param {boolean} state
		 * @return undefined
		 */
		setBanked: function(state) {
			this._isBanked = (state ? true : false);
		},
		/**
		 * Returns true if the stave is banked or not.
		 *
		 * @return {boolean}
		 */
		isBanked: function() {
			return this._isBanked;
		},
		/**
		 * Handles a "notated" event.
		 *
		 * @fires notated 
		 *
		 * @return undefined
		 */
		onNotated: function(notater) {
			this.trigger("notated", notater);
		},
		/**
		 * Destroys the stave.
		 */
		destroy: function() {
			if(this.notater) {
				this.notater.unbind("notated", this.onNotated);
			}
		}
	});

	MicroEvent.mixin(Stave);

	return Stave;
});
