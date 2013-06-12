require([
	'jquery', 
	'app/piano/keyboard',
	'app/midirouter',
	'app/notation'
], 
function($, PianoKeyboard, MIDIRouter, Notation) {
	$(document).ready(function() {
		var keyboard = new PianoKeyboard();
		var notation = new Notation();

		$('#piano').append(keyboard.render().el)
		$('#notation').append(notation.render().el);

		var router = new MIDIRouter();
		router.init();
	});
});
