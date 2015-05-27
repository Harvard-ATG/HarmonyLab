define([
	'lodash', 
	'app/models/keyboard_generator'
], function(
	_, 
	KeyboardGenerator
) {
	describe('KeyboardGenerator', function() {
		it('should create a generator object with a size', function() {
			var size = 49;
			var kg = new KeyboardGenerator(size);
			expect(kg.getSize()).toBe(size);
		});

		it('should throw an exception for invalid sizes', function() {
			var validSize = function() {
				new KeyboardGenerator(49);
			};
			var invalidSizeFn = function(){
				new KeyboardGenerator(50);
			};
			expect(validSize).not.toThrow();
			expect(invalidSizeFn).toThrow();
		});

		it('should return the starting MIDI note for keyboard sizes', function() {
			var sizes = [25,37,49,61,88];
			_.each(sizes, function(size) {
				var kg = new KeyboardGenerator(size);
				expect(kg.startingNote(size)).toBe(KeyboardGenerator.startingNoteForSize[size]);
			});
		});

		it('should generate valid key specs', function() {
			var size = 25;
			var expected_num_white = 15;
			var kg = new KeyboardGenerator(size);

			// check size info
			expect(kg.getSize()).toBe(size);
			expect(kg.getNumWhiteKeys()).toBe(expected_num_white);

			// check MIDI note numbers
			expect(kg.keySpecs[0].noteNumber).toBe(kg.startingNote(size));
			expect(kg.keySpecs[kg.keySpecs.length - 1].noteNumber).toBe(kg.startingNote(size) + size - 1);

			// check key spec attributes
			_.each(['noteNumber','pitch','isWhite'], function(attr, index) {
				expect(kg.keySpecs[0][attr]).toBeDefined();
			});
		});
	});
});
