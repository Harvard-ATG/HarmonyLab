define(['lodash'], function(_) {
	var util = {
		staticUrl: function(path) {
			var defaultStaticUrl = '/static/';
			var staticUrl = window.appStaticUrl || defaultStaticUrl;
			return staticUrl + path;
		}
	};
	return util;
});
