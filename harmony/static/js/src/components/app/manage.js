define([
	'module',
	'lodash',
	'jquery',
	'app/components/app',
	'app/components/ui/main_menu',
	'app/components/notifications',
	'app/components/form/exercise_form'
], function(
	module,
	_,
	$,
	AppComponent,
	MainMenuComponent,
	NotificationsComponent,
	ExerciseFormComponent
) {
	
	/**
	 * AppManageComponent class.
	 *
	 * Creates the sandbox environment for playing and experimenting
	 * with chords and chord sequences. This is the basic mode of the
	 * application for students to just play around and try things.
	 *
	 * @constructor
	 */
	var AppManageComponent = function(settings) {
		AppComponent.call(this, settings);
		_.bindAll(this, ['onAfterSubmit']);
	};
	

	AppManageComponent.prototype = new AppComponent();
	

	AppManageComponent.ready = function() {
		var app = new AppManageComponent();
		app.init();
		console.log("initialized manage component");
	};
	
	AppManageComponent.prototype.init = function() {
		$('#managetabs').tabs();
		AppComponent.prototype.init.call(this);
	};

	/**
	 * Executed after the component is setup.
	 */
	AppManageComponent.prototype.afterSetup = function() {
	};
	
	/**
	 * Returns an array of functions that will create and initialize
	 * each sub-component of the application.
	 *
	 * @return {array} of functions
	 */
	AppManageComponent.prototype.getComponentMethods = function() {
		var methods = [
			function () {
				var c = new NotificationsComponent({defaultHidden:false});
				c.init(this);
				c.renderTo("#notifications");
				this.addComponent(c);
			},
			function() {
				var c = new MainMenuComponent({
					headerEl: "#header",
					menuEl: "#mainmenu",
					menuSelector: ".js-btn-menu"
				});
				c.init(this);
				this.addComponent(c);
			},
			function() {
				var c = new ExerciseFormComponent({
					el: "#exerciseform",
					config: module.config()
				});
				c.init(this);
				this.addComponent(c);
				c.bind("afterSubmit", this.onAfterSubmit);
			}
		];
		return methods;
	};

	AppManageComponent.prototype.initComponent = function() {
		AppComponent.prototype.initComponent.apply(this, arguments);
		console.log("init component manage");
		$("#tabs").tabs();
		this.updateExerciseList();
	};
	
	AppManageComponent.prototype.updateExerciseList = function() {
		var config = module.config();
		var exercise_api_url = config.exercise_api_url;
		var $el = $("#tab-exercise-list");
		
		$.ajax(exercise_api_url,{
			method: "GET"
		}).done(function(response, textStatus, jqXHR) {
			var groups = response.data.groups;
			var $ul = $('<ul class="exercise-groups"></ul>');
			
			if (groups.length > 0) {
				$.each(groups, function(i, group) {
					var $li = $('<li>' + '<a href="'+group.url+'" target="_blank">'+group.name+'</a></li>');
					if (group.data.exercises.length > 0) {
						$li.append("<ul></ul>");
						$.each(group.data.exercises, function(j, exercise) {
							$li.children('ul').append('<li>'+'<a href="'+exercise.url+'" target="_blank">'+exercise.name+'</a></li>')
						});
					}
					$ul.append($li);
				});
				
				$el.html("").append($ul);				
			} else {
				$el.html("No exercises found.");
			}

			
		}).fail(function(jqXHR, textStatus) {
			$el.html("").append("Error loading exercise list.");
		});
	};
	
	AppManageComponent.prototype.onAfterSubmit = function() {
		this.updateExerciseList();	
	};
	


	return AppManageComponent;
});
