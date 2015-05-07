/* global define:false */
define([
	'lodash', 
	'jquery', 
	'microevent',
	'app/config'
], function(_, $, MicroEvent, Config) {
	"use strict";

	var ANALYSIS_SETTINGS = Config.get('general.analysisSettings');

	var AnalyzeWidget = function(settings) {
		settings = settings || {};
		this.el = $('<div></div>');
		this.state = _.merge(_.cloneDeep(ANALYSIS_SETTINGS), settings);
	};

	_.extend(AnalyzeWidget.prototype, {
		render: function() {
			this.el.append([
				
				'<fieldset class="settings-notation">',
					'<legend><label><input type="checkbox" name="analysis_enabled" value="1"> Analysis Enabled</label></legend>',
					'<ol>',
					'<li>',
						'<label><input type="radio" name="pitch_notation" value="note_names"> Note Names</label>',
						'<label><input type="radio" name="pitch_notation" value="scientific_pitch"> Scientific Pitch</label>',
					'</li>',
					'<li>',
						'<label><input type="radio" name="scale_notation" value="scale_degrees"> Scale Degrees</label>',
						'<label><input type="radio" name="scale_notation" value="solfege" /> Solfege</label>',						
					'</li>',
					'<li>',
						'<label><input type="checkbox" name="intervals" value="note_names"> Intervals</label>',						
					'</li>',
					'<li>',
						'<label><input type="checkbox" name="chord_notation" value="roman_numerals"> Roman Numerals</label>',						
					'</li>',
					'</ol>',
				'</fieldset>'
			].join(''));
			return this;
		}
	});

	MicroEvent.mixin(AnalyzeWidget);

	return AnalyzeWidget;
});
