require(['jquery', 'lab/piano/keyboard'], function($, Keyboard) {
	$(document).ready(function() {
		var keyboard = new Keyboard();
		keyboard.render();
		$('#piano').append(keyboard.el);
	});
});
