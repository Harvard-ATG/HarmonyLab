require([
	'lodash',
	'jquery', 
	'app/piano/keyboard',
	'app/midirouter',
	'app/notation'
], 
function(_, $, PianoKeyboard, MIDIRouter, Notation) {
	$(document).ready(function() {
		var keyboard = new PianoKeyboard(), 
			notation = new Notation(), 
			router = new MIDIRouter();


		$('#piano').append(keyboard.render().el)

		$('#staff-area').append(notation.render().el);

		$('#select_keyboard_size').on('change', function() {
			var size = parseInt($(this).val(), 10);
			var new_keyboard = new PianoKeyboard(size);
			$('#kb-wrapper').width( new_keyboard.width + 2 * $('#piano').position().left);
			$('#piano').html('').append(new_keyboard.render().el);
		});

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
