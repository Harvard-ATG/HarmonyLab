/* global define: false */
define([
	'jquery',
	'lodash', 
	'app/view/transcript/plain_sheet'
], function($, _, PlainSheet) {
	"use strict";

	/**
	 * Creates an instance of Transcript.
	 *
	 * This object is responsible for displaying the sheet music and laying out
	 * related components.
	 *
	 * @constructor
	 * @param {object} config
	 * @param {ChordBank} config.chords Required property.
	 * @param {KeySignature} config.keySignature Required property.
	 */
	var Transcript = function(config) {
		this.init(config);
	};

	_.extend(Transcript.prototype, {
		/**
		 * The sheet object that generates the sheet music.
		 * @type {object}
		 */
		sheet: null,
		/**
		 * The layout size.
		 * @type {object}
		 */
		layout: {
			width: 520,
			height: 355
		},
		/**
		 * Initializes the transcript.
		 *
		 * @param {object} config
		 * @return undefined
		 */
		init: function(config) {
			this.config = config;
			this.initConfig();

			this.el = $('<div></div>');
			this.el[0].width = this.getWidth(); 
			this.el[0].height = this.getHeight(); 

			this.initSheet();
		},
		/**
		 * Initializes the config
		 *
		 * @throws {error} Will throw an error if any required properties are
		 * missing.
		 * @return undefined
		 */
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
		/**
		 * Initializes the sheet music.
		 *
		 * @return undefined
		 */
		initSheet: function() {
			var config = {
				transcript: this,
				chords: this.chords, 
				keySignature: this.keySignature
			};
			this.sheet = new PlainSheet(config);
		},
		/**
		 * Renders the transcript.
		 *
		 * @return this
		 */
		render: function() { 
			this.sheet.clear();
			this.sheet.render();
			return this;
		},
		/**
		 * Returns the width.
		 *
		 * @return {number}
		 */
		getWidth: function() {
			return this.layout.width;
		},
		/**
		 * Returns the height.
		 *
		 * @return {number}
		 */
		getHeight: function() {
			return this.layout.height;
		}
	});

	return Transcript;
});
