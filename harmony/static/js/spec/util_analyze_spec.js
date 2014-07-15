define([
	'lodash',
	'app/models/key_signature',
	'app/utils/analyze'
], function(_, KeySignature, Analyze) {

	describe("getIntervalsAboveBass", function() {
		var key_signature = new KeySignature();
		var analyze = new Analyze(key_signature);

		it("gets interval entry regardless of note order", function() {
			var expected_interval_entry = "47";
			var note_tests = [
				[65, 69, 72],
				[53, 69, 72],
				[53, 60, 69]
			];

			_.each(note_tests, function(notes) {
				var entry = analyze.getIntervalsAboveBass(notes);
				expect(entry).toBe(expected_interval_entry);
			});
		});
	});

	describe("stripRepeatedPitchClasses", function() {
		var key_signature = new KeySignature();
		var analyze = new Analyze(key_signature);

		it("returns all the notes because they are unique pitch classes", function() {
			var notes = [60,65,71];
			var uniquePitches = analyze.stripRepeatedPitchClasses(notes);
			expect(uniquePitches).toEqual(notes);
		});

		it("returns only the first note because they are all the same pitch class", function() {
			var notes = [36,48,60,72,84];
			var expected = [36];
			var uniquePitches = analyze.stripRepeatedPitchClasses(notes);
			expect(uniquePitches).toEqual(expected);
		});
	
		it("returns only the unique pitch classes", function() {
			var notes = [48,60,65,71,72,73,77,84,85,86];
			var expected = [48,65,71,73,86];
			var uniquePitches = analyze.stripRepeatedPitchClasses(notes);
			expect(uniquePitches).toEqual(expected);
		});
	});

});
