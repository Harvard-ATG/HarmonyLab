define([
	'lodash'
], function(
	_
) {
	/**
	 * ExerciseGrader object is responsible for grading a given inputChords for
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
		 * @param {ChordBank} inputChords The chord bank that will server as inputChords
		 * @return {object} A result object
		 */
		grade: function(definition, inputChords) {
			var problems = definition.getProblems();
			var items = inputChords.items();
			var chords = _.pluck(items, "chord");
			var graded = {
				result: null,
				score: 0,
				problems:[]
			};
			var score_map = {};
			var result_map = []; 
			var i, len, result, score, active_idx = problems.length; 

			score_map[CORRECT]=0;
			score_map[PARTIAL]=1;
			score_map[INCORRECT]=2;
			result_map = [CORRECT,PARTIAL,INCORRECT];
			score = score_map[CORRECT];

			for(i = 0, len = problems.length; i < len; i++) {
				expected_notes = problems[i].notes;
				actual_notes = [];
				if(chords[i]) {
					actual_notes = chords[i].getNoteNumbers();
				}
				result = this.notesMatch(expected_notes, actual_notes);
				graded.problems[i] = {
					score: score_map[result.state],
					count: result.count,
					note: result.note,
					notes: result.notes
				};
				if(score_map[result.state] > score) {
					score = score_map[result.state];
					active_idx = i;
				}
			}

			graded.score = score;
			graded.result = result_map[score];
			graded.activeIndex = active_idx;

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
				count: {},
				note: {},
				notes: []
			};
			var i, len, note; 

			result.count[INCORRECT] = [];
			result.count[CORRECT] = [];

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
					result.count[CORRECT].push(note);
					result.note[note] = CORRECT;
					++actual_matches;
				} else {
					++incorrect_matches;
					result.count[INCORRECT].push(note);
					result.note[note] = INCORRECT;
				}
				result.notes.push(note);
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
