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

		it("should create an exercise definition with one problem", function() {
			var problem = {
				"text": "foo",
				"notes": [60,61,62]
			};
			var settings = {
				definition: {
					type: "matching",
					problems: [problem]
				}
			};
			var ed = new ExerciseDefinition(settings);
			expect(ed.hasProblems()).toBe(true);
			expect(ed.getProblemAt(0)).toEqual(problem);
		});
	});
});
