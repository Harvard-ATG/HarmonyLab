require(['jquery', 'lodash', 'lab/piano/keyboard'], function($, _, PianoKeyboard) {
	$(document).ready(function() {
		var keyboard = new PianoKeyboard();
		keyboard.render();
		$('#piano').append(keyboard.el);
	});
});
