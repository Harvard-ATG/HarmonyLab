define(['lodash','app/util'], function(_, util) {
	"use strict";

	describe("Static url", function() {
		it("sets a default static url", function() {
			expect(util.staticUrl()).toBe('/static/');
			expect(util.staticUrl('foo')).toBe('/static/foo');
			expect(util.staticUrl('foo/bar')).toBe('/static/foo/bar');
		});

		it("uses the defined app static url", function() {
			var appStaticUrl = '/my-static-url/';
			window.appStaticUrl = appStaticUrl;
			expect(util.staticUrl()).toBe(appStaticUrl);
			expect(util.staticUrl('foo/bar')).toBe(appStaticUrl+'foo/bar');
		});
	});

	describe("Word wrapping some text", function() {
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
