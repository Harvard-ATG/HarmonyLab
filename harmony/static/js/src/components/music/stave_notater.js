/* global define: false */ 
define([
	'lodash', 
	'vexflow',
	'microevent',
	'app/util',
	'app/utils/analyze'
], function(
	_, 
	Vex, 
	MicroEvent,
	util, 
	Analyze
) {
	"use strict";

	/**
	 * Defines an image of a metronome that may be rendered to a canvas element.
	 * @type {Image}
	 * @const
	 */
	var METRONOME_IMG = (function() {
		var img = new Image();
		img.src = util.staticUrl('img/metronome-black.png');
		return img;
	})();

	/**
	 * This is an abstract class that defines the interface for the
	 * StaveNotater.
	 *
	 * This abstract class should provide methods to notate the following types
	 * of things:
	 *
	 * - Note names
	 * - Solfege pitch notation
	 * - Helmholtz pitch notation
	 * - Scale degrees
	 * - Intervals
	 * - Roman numeral analysis
	 *
	 * At its simplest, a Stave should configure the notater with the kinds of
	 * things it wants notated, passing a reference to itself, and then call the
	 * notate() method to render those things on the stave.
	 *
	 * @constructor
	 */
	var StaveNotater = function() {
	};

	StaveNotater.BASS = 'bass';
	StaveNotater.TREBLE = 'treble';

	_.extend(StaveNotater.prototype, {
		/**
		 * Defines the margin for rendering things above and below the stave.
		 * @type {object}
		 */
		margin: {'top': 25, 'bottom': 25},
		/**
		 * Defines the text limit used to wrap text.
		 * @type {number}
		 */
		textLimit: 15,
		/** 
		 * Defines the height of a line of text.
		 * @type {number}
		 */
		textLineHeight: 15,
		/**
		 * Defines the default font size.
		 * @type {string}
		 */
		defaultFontSize: "1.125em",
		/**
		 * Initializes the notater.
		 *
		 * @param {object} config
		 * @param {Stave} config.stave
		 * @param {KeySignature} config.keySignature
		 * @param {object} config.analyzeConfig
		 * @return undefined
		 */
		init: function(config) {
			this.config = config;
			this.initConfig();
			_.bindAll(this, 'drawMetronomeMark');
		},
		/**
		 * Initializes the config
		 *
		 * @return undefined
		 * @throws {Error} Will throw an error if a config param is missing.
		 */
		initConfig: function() {
			var required = ['stave', 'keySignature', 'analyzeConfig'];
			_.each(required, function(propName) {
				if(this.config.hasOwnProperty(propName)) {
					this[propName] = this.config[propName];
				} else {
					throw new Error("missing required config property: "+propName);
				}
			}, this);

			// optional
			if(this.config.hasOwnProperty('chord')) {
				this.chord = this.config.chord;
			}
		},
		/**
		 * Notates the Stave if the notater is enabled.
		 *
		 * @fires notated
		 * @return undefined
		 */
		notate: function() {
			var ctx = this.getContext();

			ctx.save();
			ctx.font = this.getTextFont();

			this.notateStave();

			if(this.isAnalyzerEnabled()) {
				this.updateAnalyzer();
				if(this.chord) {
					this.notateChord();
				}
			}

			ctx.restore();

			this.trigger("notated", this);
		},
		/**
		 * Creates an analyzer object used to return analysis information about
		 * what is being played.
		 *
		 * @return {Analyze}
		 */
		createAnalyzer: function() {
			return new Analyze(this.keySignature); 
		},
		/**
		 * Updates the analyzer object.
		 *
		 * @return undefined
		 */
		updateAnalyzer: function() {
			this.analyzer = this.createAnalyzer();
		},
		/**
		 * Returns the analyzer object.
		 *
		 * @return {Analyze}
		 */
		getAnalyzer: function() {
			return this.analyzer;
		},
		/**
		 * Returns the canvas rendering context.
		 *
		 * @return {object}
		 */
		getContext: function() {
			return this.stave.getContext();
		},
		/**
		 * Returns the font for annotations.
		 *
		 * @return {string}
		 */
		getTextFont: function(size) {
			if(!size) {
				size = this.defaultFontSize; 
			}
			return size + " LinLibertine, Helvetica, sans-serif";
		},
		/**
		 * Returns the font for rendering icons.
		 *
		 * @return {string}
		 */
		getIconFont: function(size) {
			if(!size) {
				size = this.defaultFontSize;
			}
			return size + " Ionicons";
		},
		/**
		 * Returns the font for rendering figured bass.
		 *
		 * @return {string}
		 */
		getFiguredBassFont: function(size) {
			if(!size) {
				size = "1.75em";
			}
			return size + " Sebastian";
		},
		/**
		 * Returns the X position for notating.
		 *
		 * @return {number}
		 */
		getX: function() {
			return this.stave.getStartX() + 10;
		},
		/**
		 * Returns the Y position for notating.
		 *
		 * @abstract
		 * @return {number}
		 */
		getY: function() {
			throw new Error("subclass responsibility");
		},
		/**
		 * Returns the current tempo of the metronome.
		 *
		 * @return {number}
		 */
		getTempo: function() {
			return this.analyzeConfig.tempo;
		},
		/**
		 * Returns true if analysis is enabled, false otherwise.
		 *
		 * @return {boolean}
		 */
		isAnalyzerEnabled: function() {
			return this.analyzeConfig.enabled;
		},
		/**
		 * Draws the note name.
		 *
		 * @param {number} x
		 * @param {number} y
		 * @return undefined
		 */
		drawNoteName: function(x, y) {
			var ctx = this.getContext();
			var notes = this.chord.getNoteNumbers();
			var note_name = this.getAnalyzer().getNameOfNote(notes);

			if(note_name !== '') {
				ctx.fillText(note_name, x, y);
			}
		},
		/**
		 * Draws the name of a note in helmholtz pitch notation.
		 *
		 * @param {number} x
		 * @param {number} y
		 * @return undefined
		 */
		drawHelmholtz: function(x, y) {
			var ctx = this.getContext();
			var notes = this.chord.getNoteNumbers();
			var note_name = this.getAnalyzer().getNoteName(notes[0],notes);
			var helmholtz = this.getAnalyzer().toHelmholtzNotation(note_name);

			if(helmholtz !== '') {
				ctx.fillText(helmholtz, x, y);
			}
		},
		/**
		 * Draws the name of a note in scientific pitch notation.
		 *
		 * @param {number} x
		 * @param {number} y
		 * @return undefined
		 */
		drawScientificPitch: function(x, y) {
			var ctx = this.getContext();
			var notes = this.chord.getNoteNumbers();
			var note_name = this.getAnalyzer().getNoteName(notes[0],notes);
			var scientific_pitch = this.getAnalyzer().toScientificPitchNotation(note_name);

			if(scientific_pitch !== '') {
				ctx.fillText(scientific_pitch, x, y);
			}
		},
		/**
		 * Draws solfege.
		 *
		 * @param {number} x
		 * @param {number} y
		 * @return undefined
		 */
		drawSolfege: function(x, y) {
			var ctx = this.getContext();
			var notes = this.chord.getNoteNumbers();
			var solfege = this.getAnalyzer().getSolfege(notes);

			solfege = this.convertSymbols(solfege);
			if (solfege.indexOf("<br>") !== -1) {
				solfege = solfege.split("<br>")[0];
			}

			if(solfege !== '') {
				ctx.fillText(solfege, x, y);
			}
		},
		/**
		 * Draws the scale degree.
		 *
		 * @param {number} x
		 * @param {number} y
		 * @return undefined
		 */
		drawScaleDegree: function(x, y) {
			var ctx = this.getContext();
			var notes = this.chord.getNoteNumbers();
			var width = 0, caret_offset = 0, caret_x = x;
			var numeral = this.getAnalyzer().getScaleDegree(notes);

			if(numeral !== '') {
				numeral = this.convertSymbols(numeral);
				width = ctx.measureText(numeral).width;
				//x = x + 8 + Math.floor(width/2);
				caret_offset = ctx.measureText(numeral.slice(0,-1)).width;
				caret_x = x - 1 + (numeral.length > 1 ? caret_offset : 0);

				ctx.fillText(numeral, x, y);
				ctx.fillText("^", caret_x, y - 10);
			}
		},
		/**
		 * Draws the roman numeral analysis.
		 *
		 * @param {number} x
		 * @param {number} y
		 * @return undefined
		 */
		drawRoman: function(x, y) {
			var notes = this.chord.getNoteNumbers();
			var ctx = this.getContext();
			var chord_entry = this.getAnalyzer().findChord(notes);
			var label;

			if(chord_entry) {
				label = chord_entry.label;
				this.parseAndDraw(label, x, y, function(text, x, y) {
					text = this.convertSymbols(text);
					var lines = this.wrapText(text);
					this.drawTextLines(lines, x, y);
					return ctx.measureText(lines[0]).width; // return the width of the first line
				});
			}
		},
		/**
		 * Draws the interval analysis.
		 *
		 * @param {number} x
		 * @param {number} y
		 * @return undefined
		 */
		drawInterval: function(x, y) {
			var notes = this.chord.getNoteNumbers();
			var ctx = this.getContext();
			var interval = this.getAnalyzer().ijNameDegree(notes);
			var name = '', lines = [];
			
			if(interval && interval.name !== '') {
				lines = this.wrapText(interval.name);
				this.drawTextLines(lines, x, y);
			}
		},
		/**
		 * Draws the metronome mark.
		 *
		 * @param {number} x
		 * @param {number} y
		 * @return undefined
		 */
		drawMetronomeMark: function(x, y) {
			var ctx = this.getContext();
			var tempo = this.getTempo();
			var metronomeImg = METRONOME_IMG;

			if(tempo) {
				if(metronomeImg && metronomeImg.complete) {
					ctx.drawImage(metronomeImg, x, y - 28);
					ctx.fillText(tempo, x, y);
				} else {
					metronomeImg.onload = _.partial(this.drawMetronomeMark, x, y);
				}
			}
		},
		/**
		 * Draws the key signature name (i.e. C major, etc).
		 *
		 * @param {number} x
		 * @param {number} y
		 * @return undefined
		 */
		drawKeyName: function(x, y) {
			var ctx = this.getContext();
			var key = this.keySignature.getKeyShortName();
			if(key !== '') {
				ctx.fillText(this.convertSymbols(key) + ':', x, y);
			}
		},
		/**
		 * Draws a sequence of text lines on the canvas.
		 *
		 * @param {array} lines
		 * @param {number} x
		 * @param {number} y
		 * @return
		 */
		drawTextLines: function(lines, x, y) {
			var ctx = this.getContext(); 
			var line_height = this.textLineHeight;
			var line_y, i, len;

			for(i = 0, len = lines.length; i < len; i++) {
				line_y = y + (i * line_height);
				ctx.fillText(lines[i], x, line_y);
			}
		},
		/**
		 * Parses a string of text to find out which font to use, and then draws
		 * the resulting text tokens with the necessary font. 
		 *
		 * There are only two fonts:
		 * 		1. the standard text font (i.e. Helvetica, etc).
		 *		2. "Sebastian" which is a special font for rendering figured bass notation 
		 *		   (FiguredBassMHGPL is another such font, but we're using Sebastian).
		 * 
		 * Text that uses font #2 should be wrapped in brackets: "{TEXT}".
		 *
		 * This is very similar to the way templating engines work except all we're doing is
		 * substituting a different font instead of a different value for the text, that way
		 * the text is rendered correctly.
		 *
		 * Example: 
		 * 		Source string = "foo{5e}bar{6q}++" 
		 * 		Parsed result = ["foo", "{5e}", "bar", "{6q}", "++"]
		 *
		 * @param {string} str  - the string to draw
		 * @param {number} x - the x coordinate to draw 
		 * @param {number} y - the y coordinate to draw at
		 * @param {function} callback - called to draw the text once the font is activated
		 * @return undefined
		 */
		parseAndDraw: function(str, x, y, callback) {
			var ctx = this.getContext();
			var re =  /([^{}]+|(\{[^{}]+\}))/g;
			var m, text;

			while ((m = re.exec(str)) != null) {
				if (m.index === re.lastIndex) {
					re.lastIndex++;
				}
				text = m[1];
				if(text == "" || typeof text == "undefined") {
					continue;
				}

				if(text.charAt(0) == "{" && text.charAt(text.length-1) == "}") {
					text = text.substr(1, text.length-2); // extract the TEXT in "{TEXT}"
					ctx.save();
					ctx.font = this.getFiguredBassFont();
					x += callback.call(this, text, x, y);
					x += 4; // padding
					ctx.restore();
				} else {
					x += callback.call(this, text, x, y);
					x += 4; // padding
				}
			}

		},
		/**
		 * Notates the stave.
		 *
		 * Always called, in contrast to notateChord().
		 *
		 * @abstract
		 * @return undefined
		 */
		notateStave: function() {
			throw new Error("subclass responsibility");
		},
		/**
		 * Notates the chord. 
		 *
		 * Only called if the notater has a reference to the chord and analysis
		 * is enabled.
		 *
		 * @abstract
		 * @return undefined
		 */
		notateChord: function() {
			throw new Error("subclass responsibility");
		},
		/**
		 * Wraps text. Delegates to utility method.
		 *
		 * @param {string} text
		 * @return {array}
		 */
		wrapText: function(text) {
			return util.wrapText(text, this.textLimit);
		},
		/**
		 * Converts symbols to unicode. Delegates to utility method. 
		 *
		 * @param {string} text
		 * @return {string}
		 */
		convertSymbols: function(text) {
			return util.convertSymbols(text);
		}
	});

	//------------------------------------------------------------

	/**
	 * Creates an instance of TrebleStaveNotater.
	 *
	 * This object is responsible for knowing how to notate treble staves.
	 *
	 * @constructor
	 * @param {object} config
	 */
	var TrebleStaveNotater = function(config) {
		this.init(config);
		this.clef = StaveNotater.TREBLE;
	};

	/**
	 * Inherits from StaveNotater.
	 */
	TrebleStaveNotater.prototype = new StaveNotater();

	_.extend(TrebleStaveNotater.prototype, {
		/**
		 * Set the Y position for notation above the top of the stave.
		 *
		 * @return {number}
		 */
		getY: function() {
			return this.stave.getTopY() - this.margin.top;
		},
		/**
		 * Notates the chord. 
		 *
		 * Only called if the notater has a reference to the chord and analysis
		 * is enabled.
		 *
		 * @return undefined
		 */
		notateChord: function() {
			var x = this.getX();
			var y = this.getY();
			var notes = this.chord.getNoteNumbers();
			var first_row = y, second_row = y + 25;
			var mode = this.analyzeConfig.mode;

			if(notes.length === 1) {
				// first row of mutually exclusive options
				if(mode.scale_degrees && !mode.solfege) {
					this.drawScaleDegree(x, first_row);
				} else if(mode.solfege && !mode.scale_degrees) {
					this.drawSolfege(x, first_row); 
				}

				// second row of mutually exclusive options
				if(mode.note_names && !mode.helmholtz) {
					this.drawNoteName(x, second_row);
				} else if(mode.scientific_pitch && !mode.note_names) {
					this.drawScientificPitch(x, second_row);
				}
			}
		},
		/**
		 * Notates the stave.
		 *
		 * Always called, in contrast to notateChord().
		 *
		 * @return undefined
		 */
		notateStave: function() {
			var x = this.getX();
			var y = this.getY();

			if(this.stave.isFirstBar()) {
				this.drawMetronomeMark(x, y);
			}
		}
	});

	MicroEvent.mixin(TrebleStaveNotater);

	//------------------------------------------------------------

	/**
	 * Creates an instance of BassStaveNotater.
	 *
	 * This object is responsible for knowing how to notate bass staves.
	 *
	 * @constructor
	 * @param {object} config
	 */
	var BassStaveNotater = function(config) {
		this.init(config);
		this.clef = StaveNotater.BASS;
	};

	/**
	 * Inherits from StaveNotater.
	 */
	BassStaveNotater.prototype = new StaveNotater();

	_.extend(BassStaveNotater.prototype, {
		/**
		 * Set the Y position for notation below the bottom of the stave.
		 *
		 * @return {number}
		 */
		getY: function() {
			return this.stave.getBottomY() + this.margin.bottom;
		},
		/**
		 * Notates the chord. 
		 *
		 * Only called if the notater has a reference to the chord and analysis
		 * is enabled.
		 *
		 * @return undefined
		 */
		notateChord: function() {
			var x = this.getX();
			var y = this.getY(); 
			var notes = this.chord.getNoteNumbers();
			var num_notes = notes.length;
			var mode = this.analyzeConfig.mode;

			if(num_notes == 2) {
				if(mode.intervals) {
					this.drawInterval(x, y);
				}
			} else if(num_notes > 2) {
				if(mode.roman_numerals) {
					this.drawRoman(x, y);
				}
			}
		},
		/**
		 * Notates the stave.
		 *
		 * Always called, in contrast to notateChord().
		 *
		 * @return undefined
		 */
		notateStave: function() {
			var x = this.getX();
			var y = this.getY();

			if(this.stave.isFirstBar()) {
				this.drawKeyName(x, y);
			}
		}
	});

	MicroEvent.mixin(BassStaveNotater);

	//------------------------------------------------------------

	/**
	 * Factory function that returns the appropriate StaveNotater.
	 *
	 * @static
	 * @param {string} clef
	 * @param {object} config
	 * @return {StaveNotater}
	 */
	StaveNotater.create = function(clef, config) {
		switch(clef) {
			case 'treble':
				return new TrebleStaveNotater(config);
			case 'bass':
				return new BassStaveNotater(config);
			default:
				throw new Error("no such notater for clef: " + clef);
		}
	};

	return StaveNotater;
});
