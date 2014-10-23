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
			expect(ed.getNumProblems()).toBe(1);
			expect(ed.getProblemAt(0).notes).toEqual(chord);
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
			expect(ed.getNumProblems()).toBe(chord.length);
			expect(ed.getProblemAt(0).notes).toEqual(chord[0]);
		});

		it("should create an exercise definition with a visible and hidden part", function() {
			var chord = [{"visible":[60,67],"hidden":[64]}];
			var expected_notes = [60,64,67];
			var settings = {
				definition: {
					type: "matching",
					chord: chord
				}
			};
			var ed = new ExerciseDefinition(settings);
			expect(ed.hasProblems()).toBe(true);
			expect(ed.getNumProblems()).toBe(chord.length);
			expect(ed.getProblemAt(0).visible).toEqual(chord[0].visible);
			expect(ed.getProblemAt(0).hidden).toEqual(chord[0].hidden);
			expect(ed.getProblemAt(0).notes).toEqual(expected_notes);
		});
	});
});
