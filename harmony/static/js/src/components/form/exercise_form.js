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
		this.widgets = {};
		this.$el = $("#exerciseform");
        console.log("form component loaded", this);
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

 	/**
	 * Initializes the form listeners.
	 *
	 * @return undefined
	 */   
	ExerciseFormComponent.prototype.initListeners = function() {
		var that = this;
		this.$el.on("submit", function(e) {
			var data = that.collectFormData();
			console.log("submit", data);
			e.preventDefault();
		});
	};
	
	/**
	 * Initializes the key signature field.
	 *
	 * @return undefined
	 */	
	ExerciseFormComponent.prototype.initKeySignatureField = function() {
		var $el = this.$el.find('.js-keysignature-widget');
		var keySignature = new KeySignature();
		var widget = new KeySignatureWidget(keySignature, {
			widgetCls: "widget-keysignature",
			lockedCls: "",
			unlockedCls: ""
		});
		widget.render();
		
		$el.append(widget.el);
		
		this.widgets.keySignature = widget;
	};

	/**
	 * Initializes the analysis and highlight settings fields.
	 *
	 * @return undefined
	 */	
	ExerciseFormComponent.prototype.initSettingsFields = function() {
		var $el = this.$el.find('.js-settings-widget');
		var analyze_widget = new AnalyzeWidget();
		var highlight_widget = new HighlightWidget();

		analyze_widget.render();
		highlight_widget.render();
		
		$el.append(highlight_widget.el, analyze_widget.el);
		
		this.widgets.analyze = analyze_widget;
		this.widgets.highlight = highlight_widget;
	};

	/**
	 * Collects all the data from the form suitable for sending
	 * to the server.
	 *
	 * @return object
	 */		
	ExerciseFormComponent.prototype.collectFormData = function() {
		var prompt = this.$el.find('textarea[name=exercise_prompt]').val();
		var key = this.widgets.keySignature.keySignature.getKey();
		var key_signature = this.widgets.keySignature.keySignature.getSignatureSpec();
		var chords = this.$el.find('input[name=exercise_chords]').val();
		var analysis_settings = this.widgets.analyze.getState();
		var highlight_settings = this.widgets.highlight.getState();
		var exercise_group = this.$el.find('input[name=exercise_group]').val();
		var new_exercise_group = this.$el.find('input[name=new_exercise_group]').val();
		new_exercise_group = new_exercise_group.replace(/\s+/, '');
		
		if (new_exercise_group) {
			exercise_group = new_exercise_group;
		}
		
		var data = {
			"prompt": prompt,
			"key": key,
			"keySignature": key_signature,
			"chords": chords,
			"exercise_group": exercise_group,
			"analysisSettings": analysis_settings,
			"highlightSettings": highlight_settings
		};
		
		return data;
	};
    
    return ExerciseFormComponent;   
});
