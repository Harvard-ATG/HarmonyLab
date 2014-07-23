define([
	'lodash',
	'microevent',
	'./chord',
	'./chord_bank'
], function(
	_,
	MicroEvent,
	Chord,
	ChordBank
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

		_.each(['definition','grader','inputChords'], function(attr) {
			if(!(attr in this.settings)) {
				throw new Error("missing settings."+attr+" constructor parameter");
			} 
		}, this);

		this.definition = this.settings.definition;
		this.grader = this.settings.grader;
		this.inputChords = this.settings.inputChords;

		this.state = ExerciseContext.STATE.READY;
		this.graded = false;
		this.displayChords = this._createDisplayChords();

		_.bindAll(this, ['grade']);

		this.init();
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
			this.inputChords.bind("change", this.grade);
		},
		grade: function() {
			var state, graded;

			graded = this.grader.grade(this.definition, this.inputChords);

			switch(graded.result) {
				case this.grader.STATE.CORRECT:
					state = ExerciseContext.STATE.CORRECT;
					break;
				case this.grader.STATE.INCORRECT:
					state = ExerciseContext.STATE.INCORRECT;
					break;
				case this.grader.STATE.PARTIAL:
				default:
					state = ExerciseContext.STATE.WAITING;
			}

			this.graded = graded;
			this.state = state;
			this.trigger("graded");
		},
		getDisplayChords: function() {
			return this.displayChords;
		},
		getInputChords: function() {
			return this.inputChords;
		},
		getState: function() {
			return this.state;
		},
		getGraded: function() {
			return this.graded;
		},
		_createDisplayChords: function() {
			var problem = this.definition.getProblemAt(0);
			var chord = new Chord({ notes: problem.notes });
			var chords = new ChordBank({ chords: [chord] });
			return chords;
		}
	});

	MicroEvent.mixin(ExerciseContext);

	return ExerciseContext;
});
