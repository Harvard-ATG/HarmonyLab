define([
	'lodash'
], function(
	_
) {
	/**
	 * ExerciseGrader object is responsible for grading a given input for
	 * an exercise.
	 *
	 * @param settings {object}
	 * @constructor
	 */
	var ExerciseGrader = function(settings) {
		this.settings = settings || {};
	};

	var INCORRECT = 'incorrect';
	var CORRECT = 'correct';
	var PARTIAL = 'partial';

	/**
	 * Defines the possible exercise result states.
	 * @const
	 */
	ExerciseGrader.STATE = {
		INCORRECT: INCORRECT,
		CORRECT: CORRECT,
		PARTIAL: PARTIAL
	};

	_.extend(ExerciseGrader.prototype, {
		/**
		 * Exposes the possible exercise result states.
		 */
		STATE: ExerciseGrader.STATE,
		/**
		 * Grades an exercise and returns a result.
		 *
		 * @param {ExerciseDefinition} definition The exercise definition
		 * @param {ChordBank} input The chord bank that will server as input
		 * @return {object} A result object
		 */
		grade: function(definition, input) {
			var problems = definition.getProblems();
			var items = input.items();
			var chords = _.pluck(items, "chord");
			var graded={
				result:null,
				problems:[]
			};
			var i, len, problem, state;

			for(i = 0, len = problems.length; i < len; i++) {
				problem = problems[i];
				expected_notes = problem.notes;
				actual_notes = chords[i].getNoteNumbers();
				state = this.notesMatch(expected_notes, actual_notes);
				graded.problems[i] = state;

				if(state === INCORRECT) {
					graded.result = INCORRECT;
				} else if(state === PARTIAL) {
					if(graded.result !== INCORRECT) {
						graded.result = PARTIAL;
					}
				} else if(state === CORRECT) {
					if(graded.result !== PARTIAL) {
						graded.result = CORRECT;
					}
				}
			}

			return graded;
		},
		/**
		 * Given a set of expected and actual notes, this function
		 * will match the notes and return one of three values:
		 *
		 *	- INCORRECT: one or more notes are incorrect
		 *	- PARTIAL: one or more notes matched, but not all
		 *	- CORRECT: all notes matches
		 *
		 * @param {array} expectedNotes
		 * @param {array} actualNotes
		 * @return {INCORRECT|PARTIAL|CORRECT} the result of the matching
		 */
		notesMatch: function(expectedNotes, actualNotes) {
			var expected_matches = 0; 
			var actual_matches = 0; 
			var bucket = {};
			var i, len; 

			for(i = 0, len = expectedNotes.length; i < len; i++) {
				bucket[expectedNotes[i]] = true;
			}

			for(var x in bucket) {
				if(bucket.hasOwnProperty(x)) {
					++expected_matches;
				}
			}

			for(i = 0, len = actualNotes.length; i < len; i++) {
				if(bucket[actualNotes[i]]) {
					++actual_matches;
				} else {
					return INCORRECT;
				}
			}

			if(actual_matches < expected_matches) {
				return PARTIAL;
			} 

			return CORRECT;
		}
	});

	return ExerciseGrader;
});
