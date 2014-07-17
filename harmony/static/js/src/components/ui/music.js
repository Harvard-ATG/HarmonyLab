define([
	'jquery',
	'lodash', 
	'app/components/component',
	'./music/plain_sheet'
], function(
	$, 
	_, 
	Component,
	PlainSheetComponent
) {

	/**
	 * Creates an instance of MusicComponent.
	 *
	 * This object is responsible for displaying the sheet music and laying out
	 * related components.
	 *
	 * @constructor
	 * @param {object} settings
	 * @param {ChordBank} settings.chords Required property.
	 * @param {KeySignature} settings.keySignature Required property.
	 */
	var MusicComponent = function(settings) {
		this.settings = settings || {};

		if(!("chords" in this.settings)) {
			throw new Error("missing settings.chords");
		}
		if(!("keySignature" in this.settings)) {
			throw new Error("missing settings.keySignature");
		}

		this.setComponent("sheet", new PlainSheetComponent(settings));

		/**
		 * Defines the width/height for the music.
		 * @type {object} 
		 */
		this.layout = {width:520, height:355};
		/**
		 * Defines the music element.
		 * @type {jQuery}
		 */
		this.el = $('<div></div>');
	};

	MusicComponent.prototype = new Component();

	_.extend(MusicComponent.prototype, {
		/**
		 * Initializes the music.
		 *
		 * @return undefined
		 */
		initComponent: function() {
			this.el[0].width = this.getWidth(); 
			this.el[0].height = this.getHeight(); 
		},
		/**
		 * Renders the music.
		 *
		 * @return this
		 */
		render: function() { 
			var sheetComponent = this.getComponent('sheet');
			sheetComponent.clear();
			sheetComponent.render();
			return this;
		},
		/**
		 * Renders the music to a selector.
		 *
		 * @return this;
		 */
		renderTo: function(selector) {
			this.render();
			$(selector).append(this.el);
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

	return MusicComponent;
});
