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
		this.initGroupNames();
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
			that.submit(data);
			e.preventDefault();
		});
	};
	
	ExerciseFormComponent.prototype.submit = function(data) {
		var url = this.settings.config.exercise_api_url;
		var that = this;

		$.ajax({
			"url": url,
			"method": "POST",
			"data": {'exercise': JSON.stringify(data)},
			"contentType": 'contentType: application/json; charset=utf-8',
			"dataType": "json"
		}).done(function(response, textStatus, jqXHR) {
			that.broadcast(EVENTS.BROADCAST.NOTIFICATION, {
				title: "Exercise Saved",
				description: "Exercise saved successfully!",
				type: "success"
			});
		}).fail(function(jqXHR, textStatus) {
			that.broadcast(EVENTS.BROADCAST.NOTIFICATION, {
				title: "Error",
				description: "Exercise not saved: " + textStatus,
				type: "error"
			});
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

	ExerciseFormComponent.prototype.initGroupNames = function() {
		console.log(this.settings);
		this.updateGroupNames(this.settings.config.group_names);
	};

	ExerciseFormComponent.prototype.updateGroupNames = function(group_names) {
		var $select = $('select[name="exercise_group"]');
		$select.html('');
		$select.append('<option value="">----</option>');
		$.each(group_names, function(index, group_name) { 
			$select.append('<option value="'+group_name+'">'+group_name+'</option>');
		});
		console.log(group_names, $select.html());
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
			"group_name": exercise_group,
			"analysisSettings": analysis_settings,
			"highlightSettings": highlight_settings
		};

		// only include the keySignature if it's unlocked
		if (this.widgets.keySignature.keySignature.locked()) {
			delete data.keySignature;
		}
		
		return data;
	};
    
    return ExerciseFormComponent;   
});
