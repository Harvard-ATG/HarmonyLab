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
			var graded= {
				result: null,
				score: 0,
				problems:[]
			};
			var score_map = {};
			var result_map = []; 
			var i, len, problem, result, state;

			score_map[CORRECT]=0;
			score_map[PARTIAL]=1;
			score_map[INCORRECT]=2;
			result_map = [CORRECT,PARTIAL,INCORRECT];

			for(i = 0, len = problems.length; i < len; i++) {
				problem = problems[i];
				expected_notes = problem.notes;
				actual_notes = chords[i].getNoteNumbers();
				result = this.notesMatch(expected_notes, actual_notes);
				graded.problems[i] = {
					score: score_map[result.state],
					counts: result.counts
				};
			}

			graded.score = _.reduce(graded.problems, function(max_score, problem) {
				return (problem.score > max_score ? problem.score : max_score);
			}, score_map[CORRECT]);

			graded.result = result_map[graded.score];

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
			var incorrect_matches = 0;
			var bucket = {};
			var result = {
				state: null,
				counts: {}
			};
			var i, len, note; 

			result.counts[INCORRECT] = [];
			result.counts[CORRECT] = [];

			for(i = 0, len = expectedNotes.length; i < len; i++) {
				bucket[expectedNotes[i]] = true;
			}

			for(var x in bucket) {
				if(bucket.hasOwnProperty(x)) {
					++expected_matches;
				}
			}

			for(i = 0, len = actualNotes.length; i < len; i++) {
				note = actualNotes[i];
				if(bucket[note]) {
					result.counts[CORRECT].push(note);
					++actual_matches;
				} else {
					++incorrect_matches;
					result.counts[INCORRECT].push(note);
				}
			}

			if(incorrect_matches > 0) {
				result.state = INCORRECT;
			} else if(actual_matches < expected_matches) {
				result.state = PARTIAL;
			} else {
				result.state = CORRECT;
			}

			return result;
		}
	});

	return ExerciseGrader;
});
