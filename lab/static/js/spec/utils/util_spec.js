define([
	'lodash',
	'app/models/key_signature',
	'app/util',
	'app/utils/analyze'
], function(_, KeySignature, util, Analyze) {

	describe("utils", function() {
		describe("static url", function() {
			it("sets a default static url", function() {
				expect(util.staticUrl()).toBe('/static/');
				expect(util.staticUrl('foo')).toBe('/static/foo');
				expect(util.staticUrl('foo/bar')).toBe('/static/foo/bar');
			});

			it("uses the defined app static url", function() {
				var appStaticUrl = '/my-static-url/';
				var savedStaticUrl = window.appStaticUrl;
				window.appStaticUrl = appStaticUrl;
				expect(util.staticUrl()).toBe(appStaticUrl);
				expect(util.staticUrl('foo/bar')).toBe(appStaticUrl+'foo/bar');
				window.appStaticUrl = savedStaticUrl;
			});
		});

		describe("word wrapping text", function() {
			var text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
			it("should wrap the text", function() {
				var num_lines = 2;
				var line_width = Math.floor(text.length / num_lines);
				var wrapped = util.wrapText(text, line_width);
				expect(wrapped.length).toBe(num_lines);
			});

			it("shouldn't wrap the text", function() {
				_.each([0,-1,null,undefined], function(lineWidth) {
					var wrapped = util.wrapText(text, lineWidth);
					expect(wrapped.length).toBe(1);
					expect(wrapped[0]).toBe(text);
				});
			});

			it("should wrap each character", function() {
				var wrapped = util.wrapText(text, 1);
				expect(wrapped.length).toBe(text.length);
			});

			it("should wrap and split word when necessary with whitespace intact", function() {
				var text = "foobar    "; // ending whitespace is intentional
				var wrapped = util.wrapText(text, 3);
				expect(wrapped.length).toBe(4);
				expect(wrapped[0]).toBe("foo");
				expect(wrapped[1]).toBe("bar");
				expect(wrapped[2]).toBe("   ");
				expect(wrapped[3]).toBe(" ");
			});
		});
	});

	describe("utils.analyze", function() {
		describe("get intervals above the bass", function() {
			var key_signature = new KeySignature();
			var analyze = new Analyze(key_signature);

			it("returns interval entry without respect to note order", function() {
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

		describe("strip repeated pitch classes", function() {
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
});
