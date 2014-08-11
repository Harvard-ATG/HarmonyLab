define([
	'lodash', 
	'app/models/exercise_grader',
	'app/models/exercise_definition',
	'app/models/chord',
	'app/models/chord_bank'
], function(
	_, 
	ExerciseGrader,
	ExerciseDefinition,
	Chord,
	ChordBank
) {
	describe("ExerciseGrader", function() {
		it("should create a grader object", function() {
			var settings = {};
			var grader = new ExerciseGrader(settings);
			expect(grader).toBeTruthy();
		});
		describe("should match notes", function() {
			it("as a CORRECT match", function() {
				var grader = new ExerciseGrader();
				var expected_notes = [60,62,64];
				var actual_note_tests = [
					[60,62,64],
					[62,60,64],
					[64,62,60],
					[64,60,62],
					[60,64,62]
				];
				_.each(actual_note_tests, function(actual_notes) {
					var result = grader.notesMatch(expected_notes, actual_notes);
					expect(result.state).toBe(grader.STATE.CORRECT);
				});
			});

			it("as a PARTIAL match", function() {
				var grader = new ExerciseGrader();
				var expected_notes = [60,62,64,70];
				var actual_note_tests = [
					[],
					[60],
					[60,62],
					[60,70],
					[64,70],
					[62,64],
					[62,64,70],
					[60,62,64]
				];
				_.each(actual_note_tests, function(actual_notes) {
					var result = grader.notesMatch(expected_notes, actual_notes);
					expect(result.state).toBe(grader.STATE.PARTIAL);
				});
			});

			it("as an INCORRECT match", function() {
				var grader = new ExerciseGrader();
				var expected_notes = [60,62,64,70];
				var actual_note_tests = [
					[1],
					[1,60],
					[60,1],
					[60,62,64,70,1],
					[1,60,62,64,70],
					[62,64,70,1,2,3]
				];
				_.each(actual_note_tests, function(actual_notes) {
					var result = grader.notesMatch(expected_notes, actual_notes);
					expect(result.state).toBe(grader.STATE.INCORRECT);
				});
			});
		});

		it("should grade an exercise and assign a result", function() {
			var tests = [{
				expected: [60,62,64],
				actual: [60,62,64],
				result: ExerciseGrader.STATE.CORRECT
			},{
				expected: [60,62,64],
				actual: [],
				result: ExerciseGrader.STATE.PARTIAL
			},{
				expected: [60,62,64],
				actual: [62,64],
				result: ExerciseGrader.STATE.PARTIAL
			},{
				expected: [60,62,64],
				actual: [64,1],
				result: ExerciseGrader.STATE.INCORRECT
			}];

			_.each(tests, function(test, idx) {
				var definition = new ExerciseDefinition({
					definition: {
						type: "matching",
						chord: test.expected
					}
				});
				var grader = new ExerciseGrader();
				var chord = new Chord({ notes: test.actual});
				var chords = new ChordBank({ chords: [chord] });
				var graded = grader.grade(definition, chords);

				expect(graded.result).toBe(test.result);
			});
		});
	});
});
