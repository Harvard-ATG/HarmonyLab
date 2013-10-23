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

	describe("Simple word wrap for given width", function() {
		var text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
		it("should wrap the text", function() {
			var num_lines = 2;
			var line_width = Math.floor(text.length / num_lines);
			var wrapped = util.wrapText(text, line_width);
			expect(wrapped.length).toBe(num_lines);
		});
	});
});
