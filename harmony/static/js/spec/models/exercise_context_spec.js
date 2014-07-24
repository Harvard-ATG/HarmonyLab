define([
	'lodash', 
	'app/models/exercise_context',
	'app/models/exercise_definition',
	'app/models/exercise_grader',
	'app/models/chord_bank'
], function(
	_, 
	ExerciseContext,
	ExerciseDefinition,
	ExerciseGrader,
	ChordBank
) {

	describe("ExerciseContext", function() {
		it("should create a context object", function() {
			var settings = {
				definition: new ExerciseDefinition({
					definition: { 
						type: "matching" 
					}
				}),
				grader: new ExerciseGrader(),
				inputChords: new ChordBank()
			};
			var ecx = new ExerciseContext(settings);

			expect(ecx.getState()).toBe(ecx.STATE.READY);
			expect(ecx.getGraded()).toBe(false);
			expect(ecx.getInputChords()).toBe(settings.inputChords);
		});
	})
});
