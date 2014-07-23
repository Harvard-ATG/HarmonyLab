define([
	'lodash',
	'microevent'
], function(
	_,
	MicroEvent
) {

	/**
	 * ExerciseContext object coordinates the display and grading of
	 * an exercise.
	 *
	 * @mixes MicroEvent
	 * @param settings {object}
	 * @param settings.definition ExerciseDefinition
	 * @param settings.grader ExerciseGrader
	 * @param settings.input ChordBank
	 * @param settings.output ChordBank
	 * @constructor
	 */
	var ExerciseContext = function(settings) {
		this.settings = settings || {};

		_.each(['definition','grader','input','output'], function(attr) {
			if(!(attr in this.settings)) {
				throw new Error("missing settings."+attr+" constructor parameter");
			}
		}, this);

		this.definition = this.settings.definition;
		this.grader = this.settings.grader;
		this.input = this.settings.input;
		this.state = ExerciseContext.STATE.READY;
		this.graded = false;

		_.bindAll(this, ['grade']);
	};

	ExerciseContext.STATE = {
		READY: 0,
		WAITING: 1,
		INCORRECT: 2,
		CORRECT: 3
	};

	_.extend(ExerciseContext.prototype, {
		init: function() {
			this.initListeners();
		},
		initListeners: function() {
			this.input.bind("change", this.grade);
		},
		grade: function() {
			var state, graded;

			graded = this.grader.grade(this.definition, this.input);

			switch(graded.result) {
				case grader.STATE.CORRECT:
					state = ExerciseContext.STATE.CORRECT;
					break;
				case grader.STATE.INCORRECT:
					state = ExerciseContext.STATE.INCORRECT;
					break;
				case grader.STATE.PARTIAL:
				default:
					state = ExerciseContext.STATE.WAITING;
			}

			this.graded = graded;
			this.state = state;
			this.trigger("graded");
		},
		getDisplay: function() {
		},
		getState: function() {
			return this.state;
		},
		getGraded: function() {
			return this.graded;
		}
	});

	MicroEvent.mixin(ExerciseContext);

	return ExerciseContext;
});
