// This module initializes the user interface.
require([
	'lodash',
	'jquery', 
	'app/midi/controller',
	'app/midi/notes',
	'app/notation',
	'app/piano',
	'app/ui/staff_tab_nav',
	'app/eventbus'
], 
function(_, $, MidiController, MidiNotes, Notation, PianoKeyboard, StaffTabNav, eventBus) {
	$(document).ready(function() {
		var keyboard = new PianoKeyboard();
		var midi_notes = new MidiNotes();
		var midi_controller = new MidiController({ midiNotes: midi_notes });
		var notation = new Notation({ midiNotes: midi_notes });

		// setup the on-screen piano keyboard
		$('#piano').append(keyboard.render().el)

		// setup the staff and notation area
		$('#staff-area').append(notation.render().el);

		// initialize the staff area tab navigation
		StaffTabNav.init();

		// setup the keyboard size selector so the user can 
		// change the on-screen keyboard
		$('#select_keyboard_size').on('change', function() {
			var size = parseInt($(this).val(), 10);
			var new_keyboard = new PianoKeyboard(size);
			var offset = $('#piano').position();
			var new_width = new_keyboard.width + (2 * offset.left);

			new_keyboard.render()
			$('#piano').html('').append(new_keyboard.el);
			$('#kb-wrapper').width(new_width);

			keyboard.destroy();
			keyboard = new_keyboard;
		});

		// setup the pedal buttons so they trigger midi pedal events
		$('#kb-pedals img').each(function(index, el) {
			var pedals = ['soft', 'sostenuto', 'sustain'],
				state = 'off';
	
			$(el).on('click', function() {
				state = (state == 'on' ? 'off' : 'on');
				eventBus.trigger('pedal', pedals[index], state); 
			});
		});

		// change the midi instruments 
		$('#select_instrument').on('change', function() {
			var instrument = $(this).val();
			eventBus.trigger('instrument', instrument);
		});

		// change the key and key signature
		$('#select_key_name').on('change', function() {
			var key_name = $(this).val();
			notation.changeKey(key_name);
		});

		// list of midi input devices 
		midi_controller.bind('devices', function(inputs, outputs, defaults) {
			options = _.map(inputs, function(input, idx) {
				return '<option value="'+idx+'">'+input.deviceName+'</option>';
			});

			if(options.length > 0) {
				$('#midi_input').html(options.join(''))
			} else {
				$('#midi_input').html('<option>---</option>');
			}
		});
		midi_controller.init();
	});
});
