require([
	'jquery', 
	'app/piano/keyboard',
	'app/midirouter'
], 
function($, PianoKeyboard, MIDIRouter) {
	$(document).ready(function() {
		var keyboard = new PianoKeyboard(25);

		$('#piano')
			.append("Piano size: <select class=\"span1\"><option>25</option><option>37</option><option selected>49</option><option>88</option></select>")
			.append(keyboard.render().el)
			.find('select')
			.on('change', function(e) {
				var size = $(this).val();
				var keyboard = new PianoKeyboard(size);
				$('#piano .keyboard').replaceWith(keyboard.render().el);
			});

		MIDIRouter.init();
	});
});
