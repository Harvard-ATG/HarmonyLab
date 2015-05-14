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
		var $new_exercise_group = $("#new_exercise_group");
		var $select_group = $("select[name=exercise_group]");
		var $exercise_chords = $("textarea[name=exercise_chords]");
		var $exercise_prompt = $("textarea[name=exercise_prompt]");

		$select_group.on('change', function(e) {
			$new_exercise_group.val("");
		});
		
		$new_exercise_group.on('change keyup', function(e) {
			var opt, opt_selected = false;
			var input = that.cleanGroupName($(this).val());
			var $options = $select_group.find('option').removeAttr('selected');

			if (input !== $(this).val()) {
				$(this).val(input);
			}

			for(var i = 0, len = $options.length; i < len; i++) {
				opt = $options[i];
				if (opt.value.substr(0, input.length) == input) {
					opt.selected = true;
					opt_selected = true;
					break;
				}
			}
			
			if (!opt_selected) {
				$options[0].selected = true;
			}
		});	
		
		this.$el.on("submit", function(e) {
			e.preventDefault();
			e.stopPropagation();

			var data = that.collectFormData();
			if (that.validate(data)) {
				that.submit(data);
			}

			return false;
		});
	};

	/**
	 * Returns the URL for submitting the form data.
	 *
	 * @return string
	 */
	ExerciseFormComponent.prototype.getSubmitUrl = function() {
		return this.settings.config.exercise_api_url
	};
	
	/**
	 * Returns an array of groups (names and urls).
	 *
	 * @return array 
	 */	
	ExerciseFormComponent.prototype.getGroupList = function() {
		return this.settings.config.group_list;
	};

	/**
	 * Returns true if the data is valid, false otherwise.
	 *
	 * Triggers one or more notifications if the data is invalid.
	 *
	 * @param {object} data the data that is being submitted
	 * @return boolean 
	 */		
	ExerciseFormComponent.prototype.validate = function(data) {
		var is_valid = true;

		if (!data.group_name) {
			is_valid = false;
			this.notify({
				title: "Error: Missing Group",
				description: "Please select or enter the group name for this exercise.",
				type: "error"
			});
			$("#fieldset_groups").css('border-color', 'red').one('click', function(evt) {
				$(this).css('border-color', '');
			});
		}
		
		return is_valid;
	};
	
	/**
	 * Triggers a notification.
	 *
	 * @param {object} msg
	 * @param {string} msg.title
	 * @param {string} msg.description
	 * @param {string} msg.type success|info|error
	 * @return undefined
	 */
	ExerciseFormComponent.prototype.notify = function(msg) {
		this.broadcast(EVENTS.BROADCAST.NOTIFICATION, {
			title: msg.title,
			description: msg.description,
			type: msg.type
		});		
	}
	
	/**
	 * Submits the form data via AJAX.
	 *
	 * Shows a "success" notification if it succeeds.
	 *
	 * @return undefined
	 */
	ExerciseFormComponent.prototype.submit = function(data) {
		var url = this.getSubmitUrl();
		var that = this;

		$.ajax({
			"url": url,
			"method": "POST",
			"data": {'exercise': JSON.stringify(data)},
			"dataType": "json"
		}).done(function(response, textStatus, jqXHR) {
			that.notify({
				title: "Exercise Saved",
				description: "Exercise saved successfully!",
				type: "success"
			});
			that.trigger("afterSubmit", response);
		}).fail(function(jqXHR, textStatus) {
			that.notify({
				title: "Error",
				description: "There was an error saving the exercise ("+textStatus+").",
				type: "error"
			});
		});
		
		return false;
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
	 * Initializes the list of group names in the select drop-down.
	 *
	 * @return undefined
	 */
	ExerciseFormComponent.prototype.initGroupNames = function() {
		this.updateGroupNames(this.getGroupList());
	};

	/**
	 * Updates the list of group names in the drop-down.
	 *
	 * @return undefined
	 */
	ExerciseFormComponent.prototype.updateGroupNames = function(group_list) {
		var $select = $('select[name="exercise_group"]');
		$select.html('');
		$select.append('<option value="">----</option>');
		$.each(group_list, function(index, group_list) { 
			$select.append('<option value="'+group_list.name+'">'+group_list.name+'</option>');
		});
	};

	/**
	 * Returns the group name cleaned.
	 *
	 * @return string
	 */		
	ExerciseFormComponent.prototype.cleanGroupName = function(name) {
		name = name.replace(/\s+/, ''); // remove non-word characters
		name = name.replace('/', '-')
		name = name.replace(/\W+/, ''); // remove non word chars 
		return name;
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
		var chords = this.$el.find('textarea[name=exercise_chords]').val();
		var analysis_settings = this.widgets.analyze.getState();
		var highlight_settings = this.widgets.highlight.getState();
		var exercise_group = this.$el.find('select[name=exercise_group]').val();
		var new_exercise_group = this.$el.find('input[name=new_exercise_group]').val();
		new_exercise_group = this.cleanGroupName(new_exercise_group);
		
		if (new_exercise_group) {
			exercise_group = new_exercise_group;
		}
		
		var data = {
			"prompt": prompt,
			"key": key,
			"keySignature": key_signature,
			"lilypond_chords": chords,
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
