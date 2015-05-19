define([
	'module',
	'lodash',
	'jquery',
	'app/components/events',
	'app/components/app',
	'app/components/ui/main_menu',
	'app/components/notifications',
	'app/components/form/exercise_form'
], function(
	module,
	_,
	$,
	EVENTS,
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

		this.$exerciseList = $("#tab-exercise-list");
		this.initListeners();
		this.updateExerciseList();
	};

	AppManageComponent.prototype.initListeners = function() {
		var that = this;
		var config = module.config();
		var exercise_api_url = config.exercise_api_url;

		var handleToggle = function(evt, $el) {
			toggleCls = $el.data('toggle-cls').split(' ');
			$el.closest(".group").next('ul').slideToggle({duration:400,easing:"easeOutCubic"});
			$el.removeClass(toggleCls[0]).addClass(toggleCls[1])
			toggleCls.reverse();
			$el.data('toggle-cls', toggleCls.join(' '));
		};

		var handleDelete = function(evt, $el) {
			var data = {
				exercise_name: $el.data('exercise-name'),
				group_name: $el.data('group-name')
			};
			var confirmed = confirm("Are you sure you want to delete this exercise or group of exercises?");
			if (!confirmed) {
				return false;
			}
			var delete_url = exercise_api_url + "&group_name="+data.group_name;
			if (data.exercise_name) {
				delete_url+="&exercise_name="+data.exercise_name
			}
			
			$.ajax({
				url:delete_url,
				method: "DELETE",
				dataType: "json",
			}).done(function(response, textStatus, jqXHR) {
				that.broadcast(EVENTS.BROADCAST.NOTIFICATION, {
					title: response.description,
					type: "success"
				});
				that.updateExerciseList();
			}).fail(function(jqXHR, textStatus) {
				that.broadcast(EVENTS.BROADCAST.NOTIFICATION, {
					title: "Error deleting exercise item ("+textStatus+")",
					type: "error"
				});	
			});
		};
		
		this.$exerciseList.on("mousedown", function(e) {
			var $target = $(e.target);
			if ($target.is("[data-toggle-cls]")) {
				handleToggle(e, $target);
			} else if ($target.is('.btn-toggle')) {
				handleToggle(e, $target.find('[data-toggle-cls]'));
			} else if ($target.is(".btn-delete")) {
				handleDelete(e, $target);
			}
		});
		this.$exerciseList.on("mouseover mouseout", function(e) {
			var $target = $(e.target);
			if ($target.closest(".js-row").length > 0) {
				$target.closest(".js-row").find(".actions").first().toggle();
			}
		});
	};
	
	AppManageComponent.prototype.updateExerciseList = function() {
		var that = this;
		var config = module.config();
		var $el = this.$exerciseList;
		var exercise_api_url = config.exercise_api_url;
		
		$.ajax(exercise_api_url,{
			method: "GET"
		}).done(function(response, textStatus, jqXHR) {
			that.renderExerciseList(response.data);	
		}).fail(function(jqXHR, textStatus) {
			$el.html("").append("Error loading exercise list.");
		});
	};
	
	AppManageComponent.prototype.renderExerciseList = function(data) {
		var $ul = $('<ul class="exercise-groups"></ul>');
		var $el = this.$exerciseList;
		var groups = data.groups;

		if (groups.length == 0) {
			$el.html("No exercises found.");
		} else {
			$.each(groups, function(i, group) {
				var $li = $([
					'<li class="js-row">',
						'<div class="group">',
							'<span class="btn btn-toggle"><i class="ion-arrow-down-b" data-toggle-cls="ion-arrow-down-b ion-arrow-right-b">&nbsp;</i></span>',
							'<a class="btn btn-group" href="'+group.url+'" target="_blank">Group: <b>'+group.name+'</b></a>',
							'<div class="actions" style="display:none">',
								'<i class="ion-close-circled btn btn-delete" data-group-name="'+group.name+'"></i>',
							'</div>',
						'</div>',
					'</li>'
				].join(''));
				if (group.data.exercises.length > 0) {
					$li.append("<ul></ul>");
					$.each(group.data.exercises, function(j, exercise) {
						var $childLi = $([
							'<li class="js-row">',
								'<a class="btn btn-exercise" href="'+exercise.url+'" target="_blank">Exercise: <b>'+exercise.name+'</b></a>',
								'<div class="actions" style="display:none">',
									'<i class="ion-close-circled btn btn-delete" data-exercise-name="'+exercise.name+'" data-group-name="'+group.name+'"></i>',
								'</div>',
							'</li>'
						].join(''));
						$childLi.addClass(j % 2 == 0 ? "odd" : "even");
						$li.children('ul').append($childLi);
					});
				}
				$ul.append($li);
			});
			
			$el.html("").append($ul);				
		}
	};
	
	AppManageComponent.prototype.onAfterSubmit = function() {
		this.updateExerciseList();	
	};
	


	return AppManageComponent;
});
