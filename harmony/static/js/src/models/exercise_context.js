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
		this.displayChords = this._createDisplayChords();

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
		 * Helper function that creates the display chords.
		 *
		 * @return {object}
		 */
		_createDisplayChords: function() {
			var problem, chord, chords; 
			var notes = [];

			if(this.definition.hasProblems()) {
				problem = this.definition.getProblemAt(0);
				notes = problem.notes;
			}

			chord = new Chord({ notes: notes });
			chords = new ChordBank({chords: [chord]});
			
			return chords;
		}
	});

	MicroEvent.mixin(ExerciseContext);

	return ExerciseContext;
});
