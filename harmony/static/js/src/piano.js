require([
	'lodash',
	'jquery', 
	'app/piano/keyboard',
	'app/midirouter',
	'app/notation'
], 
function(_, $, PianoKeyboard, MIDIRouter, Notation) {
	$(document).ready(function() {
		var keyboard = new PianoKeyboard();
		var notation = new Notation();

		$('#piano').append(keyboard.render().el)
		$('#staff-area').append(notation.render().el);

		var router = new MIDIRouter();

		router.bind('devices', function(inputs, outputs, defaults) {
			options = _.map(inputs, function(input, idx) {
				return '<option value="'+idx+'">'+input.deviceName+'</option>';
			});

			if(options.length > 0) {
				$('#midi_input').html(options.join(''))
			} else {
				$('#midi_input').html('<option>---</option>');
			}
		});

		router.init();
	});
});
