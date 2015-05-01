define([
    'lodash',
    'jquery',
    'app/components/events',
	'app/components/component',
	'app/models/key_signature',
	'app/widgets/key_signature',
	'app/widgets/analyze',
	'app/widgets/highlight'
], function(
    _,
    $,
    EVENTS,
    Component,
	KeySignature,
	KeySignatureWidget,
	AnalyzeWidget,
	HighlightWidget
) {
    "use strict";
    
    var ExerciseFormComponent = function(settings) {
        this.settings = settings || {};
        console.log("form component loaded");
    };
    
    ExerciseFormComponent.prototype = new Component();

	/**
	 * Initializes the component.
	 *
	 * @return undefined
	 */
	ExerciseFormComponent.prototype.initComponent = function() {
		this.initKeySignatureField();
		this.initSettingsFields();
		this.initListeners();
	};
	
	ExerciseFormComponent.prototype.initKeySignatureField = function() {
		var $el = $('.js-keysignature-widget');
		var keySignature = new KeySignature();
		var widget = new KeySignatureWidget(keySignature);
		widget.render();
		$el.append(widget.el);
	};
	
	ExerciseFormComponent.prototype.initSettingsFields = function() {
		var $el = $('.js-settings-widget');
		var analyze_widget = new AnalyzeWidget();
		var highlight_widget = new HighlightWidget();
		$el.append(highlight_widget.render().el, analyze_widget.render().el);
		console.log($el, analyze_widget, highlight_widget);
	};
	
	ExerciseFormComponent.prototype.addChord = function(chord_num) {
		$("#chord_list").append([
			'<div>',
				'<span>',
					'<b>Chord #'+chord_num+'</b>',
				'</span>',
				'<span>',
					'Visible: <input type="text" name="exercise_chord'+chord_num+'_visible">',
					'Hidden: <input type="text" name="exercise_chord'+chord_num+'_hidden">',
				'</span>',
			'</div>',					 
		].join(''));
	};	
    
	/**
	 * Initializes listeners.
	 *
	 * @return undefined
	 */
	ExerciseFormComponent.prototype.initListeners = function() {
		var that = this;
		$("#add_chord").on('click', function() {
			var chord_num = Number($(this).data('chord'));
			if (isNaN(chord_num)) {
				chord_num = 0;
			}
			that.addChord(chord_num);
			chord_num++;
			$(this).data('chord', chord_num);
		});
	};
    
    return ExerciseFormComponent;   
});
