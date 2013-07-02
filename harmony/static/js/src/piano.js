// This module is intended to "glue together" the various display/interactive
// components for playing notes on the piano, rendering notation, and changing settings.
require([
	'lodash',
	'jquery', 
	'app/piano/keyboard',
	'app/midirouter',
	'app/notation',
	'app/eventbus'
], 
function(_, $, PianoKeyboard, MIDIRouter, Notation, eventBus) {
	$(document).ready(function() {
		var keyboard = new PianoKeyboard(), 
			notation = new Notation(), 
			router = new MIDIRouter();


		// setup the on-screen piano keyboard
		$('#piano').append(keyboard.render().el)

		// setup the staff and notation area
		$('#staff-area').append(notation.render().el);

		// setup the keyboard size selector so the user can 
		// change the on-screen keyboard
		$('#select_keyboard_size').on('change', function() {
			var size = parseInt($(this).val(), 10);
			var new_keyboard = new PianoKeyboard(size);

			$('#kb-wrapper').width( new_keyboard.width + 2 * $('#piano').position().left);
			$('#piano').html('').append(new_keyboard.render().el);

			keyboard.destroy();
			keyboard = new_keyboard;
		});

		// setup the pedal buttons so they trigger midi pedal events
		$('#kb-pedals img').each(function(index, el) {
			var pedals = ['soft', 'sostenuto', 'sustain'],
				state = 'off';
	
			$(el).on('click', function() {
				state = (state == 'on' ? 'off' : 'on');
				eventBus.trigger('pedalMidiOutput', pedals[index], state); 
			});
		});

		// setup the list of midi input devices that the user can select and
		// activate
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
