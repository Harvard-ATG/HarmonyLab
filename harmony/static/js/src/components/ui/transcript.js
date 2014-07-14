define([
	'jquery',
	'lodash', 
	'app/components/component',
	'./transcript/plain_sheet'
], function(
	$, 
	_, 
	Component,
	PlainSheetComponent
) {

	/**
	 * Creates an instance of Transcript.
	 *
	 * This object is responsible for displaying the sheet music and laying out
	 * related components.
	 *
	 * @constructor
	 * @param {object} settings
	 * @param {ChordBank} settings.chords Required property.
	 * @param {KeySignature} settings.keySignature Required property.
	 */
	var TranscriptComponent = function(settings) {
		this.settings = settings || {};

		if(!("chords" in this.settings)) {
			throw new Error("missing settings.chords");
		}
		if(!("keySignature" in this.settings)) {
			throw new Error("missing settings.keySignature");
		}

		this.setComponent("sheet", new PlainSheetComponent(settings));

		/**
		 * Defines the width/height for the transcript.
		 * @type {object} 
		 */
		this.layout = {width:520, height:355};
		/**
		 * Defines the transcript element.
		 * @type {jQuery}
		 */
		this.el = $('<div></div>');
	};

	TranscriptComponent.prototype = new Component();

	_.extend(TranscriptComponent.prototype, {
		/**
		 * Initializes the transcript.
		 *
		 * @return undefined
		 */
		initComponent: function() {
			this.el[0].width = this.getWidth(); 
			this.el[0].height = this.getHeight(); 
		},
		/**
		 * Renders the transcript.
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
		 * Renders the transcript to a selector.
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

	return TranscriptComponent;
});
