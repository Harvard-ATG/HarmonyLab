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
	var StaveNotater = function(config) {
		this.init(config);
	};

	_.extend(StaveNotater.prototype, {
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

		//--------------------------------------------------
		// Public methods
		
		notate: function() {
			// notate the stave.
			//console.log('notate', this.stave.clef, this.stave.getStartX());
		},

		//--------------------------------------------------
		// Private methods
	});

	return StaveNotater;
});
