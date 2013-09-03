define(['lodash', 'app/util/piano_key_generator'], function(_, PianoKeyGenerator) {
	var PKG = PianoKeyGenerator;

	describe('Piano key generator', function() {

		it('should support multiple keyboard sizes', function() {
			var expectedSizes = ['25','37','49','61','88'];
			var actualSizes = _.keys(PKG.keyboardSizes);
			expect(actualSizes.sort()).toEqual(expectedSizes.sort());
		});

		it('should return the next note', function() {
			expect(PKG.nextNote('A')).toBe('B');
			expect(PKG.nextNote('G')).toBe('A');
		});

		it('should distinguish white and black notes', function() {
			expect(PKG.isWhiteNote('A')).toBe(true);
			expect(PKG.isWhiteNote(PKG.blackNote)).toBe(false);
		});

		it('should know how to calculate the octave of middle C given a note number', function() {
			var noteNum = 60;
			var expectedOctave = 4;
			expect(PKG.octaveOf(noteNum)).toBe(expectedOctave); 
		});

		it('should return a sequence of notes', function() {
			expect(PKG.generateSequence(25).join('')).toBe('C-D-EF-G-A-BC-D-EF-G-A-BC');
			expect(PKG.generateSequence(49).join('')).toBe('C-D-EF-G-A-BC-D-EF-G-A-BC-D-EF-G-A-BC-D-EF-G-A-BC');
		});
	});
});
