define([
	'lodash', 
	'app/model/key_signature',
	'app/util/analyzer'
], function(
	_, 
	KeySignature,
	Analyzer
) {
	describe('Analyzer', function() {
		it('should know how to calculate the semitonal distance between notes', function() {
			var tests = [
				[60,60,0],
				[59,60,1],
				[58,60,2],
				[48,60,12],
				[45,60,15],
				[36,60,24],
				[61,60,11],
				[73,60,11],
				[85,60,11],
				[62,60,10]
			];
			
			_.each(tests, function(test) {
				var note1 = test[0]
				var note2 = test[1];
				var expected_distance = test[2];
				var actual_distance = Analyzer.semitonalDistance(note1,note2);
				expect(actual_distance).toEqual(expected_distance);
			});
		});

		it('should know how to highlight octaves (without perfect fifths)', function() {
			var mode = {'octaves':true};
			var notes = [59,60,72,84];
			var keySignature = new KeySignature('jC_');

			expect(Analyzer.highlightNote(mode, keySignature, notes, 59)).toBe('black');
			expect(Analyzer.highlightNote(mode, keySignature, notes, 60)).toBe('blue');
			expect(Analyzer.highlightNote(mode, keySignature, notes, 72)).toBe('blue');
			expect(Analyzer.highlightNote(mode, keySignature, notes, 84)).toBe('blue');
		});

		it('should know how to highlight octaves (with perfect fifths)', function() {
			var mode = {'octaves':true};
			var notes = [59,60,67,72];
			var keySignature = new KeySignature('jC_');

			expect(Analyzer.highlightNote(mode, keySignature, notes, 59)).toBe('black');
			expect(Analyzer.highlightNote(mode, keySignature, notes, 60)).toBe('#099');
			expect(Analyzer.highlightNote(mode, keySignature, notes, 67)).toBe('green');
			expect(Analyzer.highlightNote(mode, keySignature, notes, 72)).toBe('blue');
		});

		it('should know how to highlight tritones', function() {

		});

		it('should know how to highlight doublings', function() {

		});
	});
});
