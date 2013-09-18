/* global define: false */
define([
	'jquery',
	'lodash', 
	'app/view/transcript/plain_sheet'
], function($, _, PlainSheet) {
	"use strict";

	// Responsible for displaying the sheet music
	// and laying out related components.
	var Transcript = function(config) {
		this.init(config);
	};

	_.extend(Transcript.prototype, {
		sheet: null,
		layout: {
			width: 520,
			height: 355
		},
		init: function(config) {
			this.config = config;
			this.initConfig();

			this.el = $('<div></div>');
			this.el[0].width = this.getWidth(); 
			this.el[0].height = this.getHeight(); 

			this.initSheet();
		},
		initConfig: function() {
			var required = ['chords', 'keySignature'];
			_.each(required, function(propName) {
				if(this.config.hasOwnProperty(propName)) {
					this[propName] = this.config[propName];
				} else {
					throw new Error("missing required config property: "+propName);
				}
			}, this);
		},
		initSheet: function() {
			var config = {
				transcript: this,
				chords: this.chords, 
				keySignature: this.keySignature
			};
			this.sheet = new PlainSheet(config);
		},
		render: function() { 
			this.sheet.clear();
			this.sheet.render();
			return this;
		},
		getWidth: function() {
			return this.layout.width;
		},
		getHeight: function() {
			return this.layout.height;
		}
	});

	return Transcript;
});
