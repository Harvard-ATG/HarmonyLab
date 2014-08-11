define([
	'lodash', 
	'app/models/exercise_definition'
], function(
	_, 
	ExerciseDefinition
) {
	describe("ExerciseDefinition", function() {
		it("should create an empty exercise definition", function() {
			var settings = {definition: {type: "matching"}};
			var ed = new ExerciseDefinition(settings);
			expect(ed.hasIntro()).toBe(false);
			expect(ed.hasReview()).toBe(false);
			expect(ed.hasProblems()).toBe(false);
		});

		it("should create an exercise definition with intro and review text", function() {
			var settings = {
				definition: {
					type: "matching",
					introText: "foo",
					reviewText: "bar"
				}
			};
			var ed = new ExerciseDefinition(settings);
			expect(ed.hasIntro()).toBe(true);
			expect(ed.getIntro()).toBe(settings.definition.introText);
			expect(ed.hasReview()).toBe(true);
			expect(ed.getReview()).toBe(settings.definition.reviewText);
			expect(ed.hasProblems()).toBe(false);
		});

		it("should create an exercise definition with one chord to match", function() {
			var chord = [60,61,62];
			var settings = {
				definition: {
					type: "matching",
					chord: chord
				}
			};
			var ed = new ExerciseDefinition(settings);
			expect(ed.hasProblems()).toBe(true);
			expect(ed.getProblemAt(0)).toEqual(chord);
			expect(ed.getNumProblems()).toBe(1);
		});

		it("should create an exercise definition with several chords to match", function() {
			var chord = [[60,61,62],[61,62,63],[62,63,64]];
			var settings = {
				definition: {
					type: "matching",
					chord: chord
				}
			};
			var ed = new ExerciseDefinition(settings);
			expect(ed.hasProblems()).toBe(true);
			expect(ed.getProblemAt(0)).toEqual(chord[0]);
			expect(ed.getNumProblems()).toBe(chord.length);
		});
	});
});
