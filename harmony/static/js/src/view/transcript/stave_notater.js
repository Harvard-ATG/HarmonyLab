/* global define: false */ 
define([
	'lodash', 
	'vexflow',
	'app/util/analyze',
], function(_, Vex, Analyze) {
	"use strict";

	// This object is responsible for notating and annotating a stave
	// bar with information about what is being played. In particular, 
	// it should know how and where to display the following information:
	//
	// - Note names
	// - Solfege pitch notation
	// - Helmholtz pitch notation
	// - Scale degrees
	// - Roman numerals
	// - Textual notes (i.e. intervals)
	//
	// It collaborates directly with the stave to add, layout, and render the
	// information.
	//
	// The stave may instruct this object about what kinds of things may be
	// added and then call the notate() method to render those things on the
	// stave.
	//
	var AbstractStaveNotater = function() {};
	_.extend(AbstractStaveNotater.prototype, {
		init: function(config) {
			this.config = config;
			this.initConfig();
		},
		initConfig: function() {
			var required = ['stave', 'chord', 'keySignature', 'analyze'];
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
				this.getContext().save();
				this.notateStave();
				this.getContext().restore();
			}
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
			return this.analyze.enabled;
		}
	});

	//------------------------------------------------------------

	var TrebleStaveNotater = function(config) {
		this.init(config);
	};

	TrebleStaveNotater.prototype = new AbstractStaveNotater();

	_.extend(TrebleStaveNotater.prototype, {
		getY: function() {
			return this.stave.getTopY();
		},
		notateStave: function() {
			var x = this.getX();
			var y = this.getY();
			var ctx = this.getContext();

			ctx.font = this.getFont();
			ctx.fillText('treble test', x, y);
		}
	});

	//------------------------------------------------------------

	var BassStaveNotater = function(config) {
		this.init(config);
	};

	BassStaveNotater.prototype = new AbstractStaveNotater();

	_.extend(BassStaveNotater.prototype, {
		getY: function() {
			return this.stave.getBottomY();
		},
		notateStave: function() {
			var x = this.getX();
			var y = this.getY(); 
			var ctx = this.getContext();

			ctx.font = this.getFont(); 
			ctx.fillText('bass test', x, y);
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
