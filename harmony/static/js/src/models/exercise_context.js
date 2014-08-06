define([
	'lodash',
	'microevent',
	'./exercise_chord',
	'./exercise_chord_bank'
], function(
	_,
	MicroEvent,
	ExerciseChord,
	ExerciseChordBank
) {

	/**
	 * ExerciseContext object coordinates the display and grading of
	 * an exercise.
	 *
	 * @mixes MicroEvent
	 * @param settings {object}
	 * @param settings.definition ExerciseDefinition
	 * @param settings.grader ExerciseGrader
	 * @param settings.inputChords ChordBank
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
		this.displayChords = this.createDisplayChords();
		this.exerciseChords = this.createExerciseChords();

		_.bindAll(this, ['grade']);

		this.init();
	};

	/**
	 * Defines the possible states
	 * @type {object}
	 * @const
	 */
	ExerciseContext.STATE = {
		READY: "ready",
		WAITING: "waiting",
		INCORRECT: "incorrect",
		CORRECT: "correct" 
	};

	_.extend(ExerciseContext.prototype, {
		/**
		 * Make the STATE values accessible via instance.
		 */
		STATE: ExerciseContext.STATE,
		init: function() {
			this.initListeners();
		},
		/**
		 * Initializes listeners. 
		 *
		 * @return undefined
		 */
		initListeners: function() {
			this.inputChords.bind("change", this.grade);
		},
		/**
		 * Runs the grading process for the given exercise definition
		 * and input chords.
		 *
		 * @return undefined
		 * @fires graded
		 */
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
			this.displayChords = this.createDisplayChords();
			this.trigger("graded");
		},
		/**
		 * Returns chords for display on screen.
		 *
		 * @return {object}
		 */
		getDisplayChords: function() {
			return this.displayChords;
		},
		/**
		 * Returns chords for exercise analysis on screen.
		 *
		 * @return {object}
		 */
		getExerciseChords: function() {
			return this.exerciseChords;
		},
		/**
		 * Returns the chords being used for input to the exercise.
		 *
		 * @return {object}
		 */
		getInputChords: function() {
			return this.inputChords;
		},
		/**
		 * Returns the state of the exercise context.
		 *
		 * @return {string}
		 */
		getState: function() {
			return this.state;
		},
		/**
		 * Returns a graded object for the exercise, or false
		 * if the exercise hasn't been graded yet.
		 *
		 * @return {boolean|object}
		 */
		getGraded: function() {
			return this.graded;
		},
		/**
		 * Returns the exercise definition object.
		 *
		 * @return {object}
		 */
		getDefinition: function() {
			return this.definition;
		},
		/**
		 * Helper function that creates the display chords.
		 *
		 * @return {object}
		 */
		createDisplayChords: function() {
			var d_problem, g_problem, chord, chords; 
			var notes = [];
			var problem_index = 0;
			var CORRECT = this.grader.STATE.CORRECT;

			if(this.definition.hasProblems()) {
				d_problem = this.definition.getProblemAt(problem_index);
				notes = d_problem.notes;
			}

			if(this.graded !== false) {
				g_problem = this.graded.problems[problem_index];
				notes = notes.concat(g_problem.notes);
				notes = _.uniq(notes);
			}

			chord = new ExerciseChord({ notes: notes });
			chords = new ExerciseChordBank({chords: [chord]});

			if(this.graded !== false) {
				_.each(g_problem.count, function(notes, correctness) {
					var is_correct = (correctness === CORRECT);
					if(notes.length > 0) {
						chord.grade(notes, is_correct);
					}
				}, this);
			}

			return chords;
		},
		/**
		 * Helper function that creates the exercise chords.
		 *
		 * @return {object}
		 */
		createExerciseChords: function() {
			var problem, notes = [];
			var problem_index = 0;

			if(this.definition.hasProblems()) {
				problem = this.definition.getProblemAt(problem_index);
				notes = problem.notes;
			}

			chord = new ExerciseChord({ notes: notes });
			chords = new ExerciseChordBank({chords: [chord]});

			return chords;
		}
	});

	MicroEvent.mixin(ExerciseContext);

	return ExerciseContext;
});
