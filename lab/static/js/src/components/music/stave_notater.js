/* global define: false */ 
define([
	'lodash', 
	'vexflow',
	'microevent',
	'app/util',
	'app/utils/analyze',
	'app/utils/fontparser'
], function(
	_, 
	Vex, 
	MicroEvent,
	util, 
	Analyze,
	FontParser
) {
	"use strict";

	/**
	 * Defines an image of a metronome that may be rendered to a canvas element.
	 * @type {Image}
	 * @const
	 */
	/*var METRONOME_IMG = (function() {
		var img = new Image();
		img.src = util.staticUrl('img/filename.png');
		return img;
	})();*/
	
	var PRELOADED_FONT = {};

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
		margin: {'top': 50, 'bottom': 25},
		/**
		 * Defines the text limit used to wrap text.
		 * @type {number}
		 */
		textLimit: 15,
		/** 
		 * Defines the height of a line of text.
		 * @type {number}
		 */
		textLineHeight: 18,
		/**
		 * Defines the default font size.
		 * @type {string}
		 */
		defaultFontSize: "24px",
		/**
		 * Defines a horizontal offset for use with all analytical annotations.
		 */
		annotateOffsetX: 8,
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
			return size + " 'Alegreya',serif";
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
				size = "32px";
			}
			return size + " Sebastian";
		},
		/**
		 * Preload font if it hasn't already been loaded by the browser, so 
		 * it's available to Canvas when needed.
		 *
		 * This is mostly used for loading the figured bass font "Sebastian"
		 * because the first time the canvas context font is set to "Sebastian", 
		 * it won't render properly because it takes time to load the font, but 
		 * canvas must render immediately. This fixes the issue where the first
		 * time the font is used, it doesn't work. 
		 *
		 * @return undefined
		 */
		preloadFont: function(fontFamily) {
			if (PRELOADED_FONT[fontFamily]) {
				return;
			}
			var div = document.createElement("div");
			div.style.fontFamily = fontFamily;
			div.innerHTML = "&nbsp;"; // doesn't seem to load the font without some text 
			document.getElementsByTagName("body")[0].appendChild(div);
			PRELOADED_FONT[fontFamily] = true;
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
			var note_name = this.getAnalyzer().getNameOfNote(notes).replace(/b/g,'♭').replace(/#/g,'♯'); // replace: true flat and sharp signs (substitution okay since letter names are uppercase here)
			var cFont = ctx.font;
			var fontArgs = ctx.font.split(' ');
			var newSize = '20px';
			ctx.font = newSize + ' ' + fontArgs[fontArgs.length - 1];

			if(note_name !== '') {
				ctx.fillText(note_name, x + StaveNotater.prototype.annotateOffsetX, y);
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
			var cFont = ctx.font;
			var fontArgs = ctx.font.split(' ');
			var newSize = '20px';
			ctx.font = newSize + ' ' + fontArgs[fontArgs.length - 1];

			if(helmholtz !== '') {
				ctx.fillText(helmholtz, x + StaveNotater.prototype.annotateOffsetX, y);
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
			var scientific_pitch = this.getAnalyzer().toScientificPitchNotation(note_name).replace(/b/g,'♭').replace(/#/g,'♯'); // replace: true flat and sharp signs (substitution okay since letter names are uppercase here)
			var cFont = ctx.font;
			var fontArgs = ctx.font.split(' ');
			var newSize = '20px';
			ctx.font = newSize + ' ' + fontArgs[fontArgs.length - 1];

			if(scientific_pitch !== '') {
				ctx.fillText(scientific_pitch, x + StaveNotater.prototype.annotateOffsetX, y);
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
			var cFont = ctx.font;
			var fontArgs = ctx.font.split(' ');
			var newSize = '20px';
			ctx.font = newSize + ' ' + fontArgs[fontArgs.length - 1];

			solfege = this.convertSymbols(solfege);
			if (solfege.indexOf("<br>") !== -1) {
				solfege = solfege.split("<br>")[0];
			}

			if(solfege !== '') {
				ctx.fillText(solfege, x + StaveNotater.prototype.annotateOffsetX, y);
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
			var cFont = ctx.font;
			var fontArgs = ctx.font.split(' ');
			var newSize = '20px';
			ctx.font = newSize + ' ' + fontArgs[fontArgs.length - 1];

			if(numeral !== '') {
				numeral = this.convertSymbols(numeral);
				width = ctx.measureText(numeral).width;
				//x = x + 8 + Math.floor(width/2);
				caret_offset = ctx.measureText(numeral.slice(0,-1)).width;
				caret_x = x - 1 + (numeral.length > 1 ? caret_offset : 0);

				ctx.fillText(numeral.replace(/b/g,'♭').replace(/#/g,'♯'), x + StaveNotater.prototype.annotateOffsetX, y); // replace: true flat and sharp signs
				ctx.fillText("^", caret_x + StaveNotater.prototype.annotateOffsetX, y - 15);
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
			var chord_entry = this.getAnalyzer().findChord(notes);

			if(chord_entry) {
				this.parseAndDraw(chord_entry.label, x, y, function(text, x, y) {
					text = this.convertSymbols(text).replace(/⌀/g,'⌀'); // replace: could improve appearance of half-diminished sign with standard fonts here, but using currently using custom font instead
					var lines = this.wrapText(text);
					this.drawTextLines(lines, x + StaveNotater.prototype.annotateOffsetX, y);
					return this.getContext().measureText(lines[0]).width; // return the width of the first line
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
			var cFont = ctx.font;
			var fontArgs = ctx.font.split(' ');
			var newSize = '24px';
			ctx.font = newSize + ' ' + fontArgs[fontArgs.length - 1];
			
			if(interval && interval.name !== '') {
				lines = this.wrapText(interval.name);
				this.drawTextLines(lines, x + StaveNotater.prototype.annotateOffsetX, y);
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
			/*var img = METRONOME_IMG;*/
			var cFont = ctx.font;
			var fontArgs = ctx.font.split(' ');
			var newSize = '16px';
			ctx.font = newSize + ' ' + fontArgs[fontArgs.length - 1];

			if(tempo) {
				ctx.fillText('M.M. = ' + tempo, x - 25/* + img.width*/, y + 25);
			}
		},
		/**
		 * Draws the key name (i.e. C major, etc).
		 *
		 * @param {number} x
		 * @param {number} y
		 * @return undefined
		 */
		drawKeyName: function(x, y) {
			var ctx = this.getContext();
			var key = this.keySignature.getKeyShortName();
			var cFont = ctx.font;
			var fontArgs = ctx.font.split(' ');
			var newSize = '20px';
			ctx.font = newSize + ' ' + fontArgs[fontArgs.length - 1];
			if(key !== '') {
				ctx.fillText(this.convertSymbols(key) + ' :', x - 8, y);
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
		 * the resulting text tokens with the necessary font. Text that
		 * should be rendered with the figured bass font should be wrapped in
		 * curly brackets: "foo{text}bar"
		 *
		 * @param {string} str  - the string to draw
		 * @param {number} x - the x coordinate to draw 
		 * @param {number} y - the y coordinate to draw at
		 * @param {function} callback - called to draw the text once the font is activated
		 * @return undefined
		 */
		parseAndDraw: function(str, x, y, callback) {
			var that = this;
			var figuredBassFont = this.getFiguredBassFont();
			var ctx = this.getContext();
			var padding = ctx.measureText("n").width; // width to use for padding
			var key = this.keySignature.getKey();
			
			FontParser.parse(str, function(text, is_font_token) {
				//console.log("parse font", text, is_font_token);
				if (is_font_token) {
					ctx.save();
					ctx.font = figuredBassFont;
					x += callback.call(that, text, x, y + 3); // tweak figured bass vertical position
					x += padding / 3;
					ctx.restore();
				} else {
					var cFont = ctx.font;
					var fontArgs = ctx.font.split(' ');
					if ( key == 'h' ) {
						if ( str.length <= 6 ) {
							var newSize = '20px';
						} else {
							var newSize = '20px';
						}
					} else {
						var newSize = '24px';
					}
					ctx.font = newSize + ' ' + fontArgs[fontArgs.length - 1];
					if ( key == 'h' ) {
						if ( str.length <= 6 ) {
							var newSize = '20px'; // chord symbol fontsize
							x += callback.call(that, text.replace(/b/g,'♭').replace(/#/g,'♯'), x, y); // replace: true flat and sharp signs (substitution okay since letter names are uppercase here)
						} else {
							var newSize = '20px'; // long chord symbol fontsize
							x += callback.call(that, text.replace(/b/g,'♭').replace(/#/g,'♯').replace(/\//g,'\n/'), x, y); // replace: as above plus line break at /
						}
					} else {
						var newSize = '24px'; // Roman numeral fontsize
						x += callback.call(that, text, x, y);
					}
					x += padding / 2;					
				}				
			});
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
