require(['jquery', 'raphael', 'lab/piano/keyboard'], function($, Raphael, Keyboard) {
	var keyboard = new Keyboard();
	keyboard.render();
	$('#piano').append(keyboard.el);
});
