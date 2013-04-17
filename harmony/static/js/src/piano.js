require([
	'jquery', 
	'app/piano/keyboard'
], 
function($, PianoKeyboard) {
	$(document).ready(function() {
		var keyboard = new PianoKeyboard();
		keyboard.render();
		$('#piano').append(keyboard.el);
	});
});
