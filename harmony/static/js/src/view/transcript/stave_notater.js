/* global define: false */ 
define([
	'lodash', 
	'vexflow',
	'app/util',
	'app/util/analyze'
], function(
	_, 
	Vex, 
	util, 
	Analyze
) {
	"use strict";

	// This object is responsible for notating and annotating a stave
	// bar with information about what is being played. In particular, 
	// it should know how and where to display the following information:
	//
	// - Note names
	// - Solfege pitch notation
	// - Helmholtz pitch notation
	// - Scale degrees
	// - Intervals
	// - Roman numeral analysis
	//
	// It collaborates directly with the stave to add, layout, and render the
	// information.
	//
	// The stave may instruct this object about what kinds of things may be
	// displayed and then call the notate() method to render those things on the
	// stave.
	//
	var AbstractStaveNotater = function() {};
	_.extend(AbstractStaveNotater.prototype, {
		margin: {'top': 25, 'bottom': 25},
		init: function(config) {
			this.config = config;
			this.initConfig();
		},
		initConfig: function() {
			var required = ['stave', 'chord', 'keySignature', 'analyzeConfig'];
			_.each(required, function(propName) {
				if(this.config.hasOwnProperty(propName)) {
					this[propName] = this.config[propName];
				} else {
					throw new Error("missing required config property: "+propName);
				}
			}, this);
		},
		notate: function() {
			if(this.isEnabled()) {
				this.updateAnalyzer();
				this.getContext().save();
				this.notateStave();
				this.getContext().restore();
			}
		},
		createAnalyzer: function() {
			return new Analyze(this.keySignature); 
		},
		updateAnalyzer: function() {
			this.analyzer = this.createAnalyzer();
		},
		getAnalyzer: function() {
			return this.analyzer;
		},
		getContext: function() {
			return this.stave.getContext();
		},
		getFont: function() {
			return "12px Georgia, serif";
		},
		getX: function() {
			return this.stave.getStartX() + 10;
		},
		getY: function() {
			throw new Error("subclass responsibility");
		},
		isEnabled: function() {
			return this.analyzeConfig.enabled;
		},
		drawNoteName: function(x, y) {
			var ctx = this.getContext();
			var notes = this.chord.getNoteNumbers();
			var note_name = this.getAnalyzer().getNameOfNote(notes);

			if(note_name !== '') {
				ctx.fillText(note_name, x, y);
			}
		},
		drawHelmholtz: function(x, y) {
			var ctx = this.getContext();
			var notes = this.chord.getNoteNumbers();
			var note_name = this.getAnalyzer().getNoteName(notes[0],notes);
			var helmholtz = this.getAnalyzer().toHelmholtzNotation(note_name);

			if(helmholtz !== '') {
				ctx.fillText(helmholtz, x, y);
			}
		},
		drawSolfege: function(x, y) {
			var ctx = this.getContext();
			var notes = this.chord.getNoteNumbers();
			var solfege = this.getAnalyzer().getSolfege(notes);

			solfege = util.convertSymbols(solfege);
			if (solfege.indexOf("<br>") !== -1) {
				solfege = solfege.split("<br>")[0];
			}

			if(solfege !== '') {
				ctx.fillText(solfege, x, y);
			}
		},
		drawScaleDegree: function(x, y) {
			var ctx = this.getContext();
			var notes = this.chord.getNoteNumbers();
			var numeral = this.getAnalyzer().getScaleDegree(notes);
			var width = 0, caret_offset = 0, caret_x = x;

			numeral = util.convertSymbols(numeral);
			width = ctx.measureText(numeral).width;
			//x = x + 8 + Math.floor(width/2);
			caret_offset = ctx.measureText(numeral.slice(0,-1)).width;
			caret_x = x - 1 + (numeral.length > 1 ? caret_offset : 0);

			ctx.fillText(numeral, x, y);
			ctx.fillText("^", caret_x, y - 10);
		},
		drawRoman: function(x, y) {
			var notes = this.chord.getNoteNumbers();
			var ctx = this.getContext();
			var chord_entry = this.getAnalyzer().ijFindChord(notes);
			var label = '';

			if(chord_entry) {
				label = chord_entry.label;
				label = util.convertSymbols(label);
				if(label !== '') {
					ctx.fillText(label, x, y);
				}
			}
		},
		drawInterval: function(x, y) {
			var notes = this.chord.getNoteNumbers();
			var ctx = this.getContext();
			var interval = this.getAnalyzer().ijNameDegree(notes);
			var name = '';
			
			if(interval) {
				name = interval.name;
				if(name !== '') {
					ctx.fillText(name, x, y);
				}
			}
		}
	});

	//------------------------------------------------------------

	var TrebleStaveNotater = function(config) {
		this.init(config);
	};

	TrebleStaveNotater.prototype = new AbstractStaveNotater();

	_.extend(TrebleStaveNotater.prototype, {
		getY: function() {
			return this.stave.getTopY() - this.margin.top;
		},
		notateStave: function() {
			var x = this.getX();
			var y = this.getY();
			var ctx = this.getContext();
			var notes = this.chord.getNoteNumbers();
			var first_row = y, second_row = y + 25;
			var mode = this.analyzeConfig.mode;

			ctx.font = this.getFont();

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
				} else if(mode.helmholtz && !mode.note_names) {
					this.drawHelmholtz(x, second_row);
				}
			}
		}
	});

	//------------------------------------------------------------

	var BassStaveNotater = function(config) {
		this.init(config);
	};

	BassStaveNotater.prototype = new AbstractStaveNotater();

	_.extend(BassStaveNotater.prototype, {
		getY: function() {
			return this.stave.getBottomY() + this.margin.bottom;
		},
		notateStave: function() {
			var x = this.getX();
			var y = this.getY(); 
			var ctx = this.getContext();
			var notes = this.chord.getNoteNumbers();
			var num_notes = notes.length;

			ctx.font = this.getFont(); 

			if(num_notes == 2) {
				this.drawInterval(x, y);
			} else if(num_notes > 2) {
				this.drawRoman(x, y);
			}
		}
	});

	//------------------------------------------------------------

	var factory = function(clef, config) {
		switch(clef) {
			case 'treble':
				return new TrebleStaveNotater(config);
			case 'bass':
				return new BassStaveNotater(config);
			default:
				throw new Error("no such notater for clef: " + clef);
		}
	};

	return {'create':factory};
});
