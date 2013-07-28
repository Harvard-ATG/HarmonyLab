// This module initializes the user interface.
require([
	'lodash',
	'jquery', 
	'app/midi/controller',
	'app/midi/instruments',
	'app/midi/notes',
	'app/notation',
	'app/piano',
	'app/ui/staff_tab_nav',
	'app/widget/key_signature',
	'app/eventbus'
], 
function(
	_,
	$,
	MidiController,
	midiInstruments,
	MidiNotes,
	Notation,
	PianoKeyboard,
	StaffTabNav,
	KeySignatureWidget,
	eventBus
) {
	var setup = {
		initOnScreenPiano: function(keyboard) {
			$('#piano').append(keyboard.render().el)
		},
		initNotation: function(notation) {
			$('#staff-area').append(notation.render().el);
		},
		initTabs: function() {
			// activate the tab menus around the staff area
			StaffTabNav.init();
		},
		initInstruments: function() {
			var el = $('#select_instrument');
			var tpl = _.template('<option value="<%= num %>"><%= name %></option>');
			var enabled = midiInstruments.getEnabled();

			_.each(enabled, function(instrument, index) {
				el.append(tpl(instrument));
			});

			el.on('change', function() {
				var instrument_num = $(this).val();
				eventBus.trigger('instrument', instrument_num);
			});
		},
		initPedals: function() {
			$('#kb-pedals .pedal').each(function(index, el) {
				var pedals = ['soft', 'sostenuto', 'sustain'];
				var state = 'off';
		
				$(el).on('click', function() {
					state = (state == 'on' ? 'off' : 'on');
					$(el).toggleClass('pedal-active');
					eventBus.trigger('pedal', pedals[index], state); 
				});
			});
		},
		initKeyboardSizes: function(keyboard) {
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

		},
		initKeyAndSignature: function(notation) {
			var widget = new KeySignatureWidget();
			widget.bind('changekey', function(key) {
				notation.changeKey(key);
			});
			widget.bind('changesignature', function(key, v) {
				notation.changeKey(key);
			});
			$('#key_signature_widget').append(widget.render().el);
		},
		initDevices: function(midi_controller) {
			midi_controller.bind('devices', function(inputs, outputs, defaults) {
				var tpl = _.template('<option value="<%= id %>"><%= name %></option>');
				var makeOptions = function(device, idx) {
					return tpl({ id: idx, name: device.deviceName });
				};
				var devices = {
					'input': {
						'selector': '#select_midi_input',
						'options': _.map(inputs, makeOptions),
					},
					'output': {
						'selector': '#select_midi_output', 
						'readonly': true,
						'options': _.map(outputs, makeOptions)
					}
				};

				_.each(devices, function(device, type) {
					if(device.options.length > 0) {
						$(device.selector).html(device.options.join(''))
					} else {
						$(device.selector).html('<option>--</option>');
					}

					if(device.readonly) {
						$(device.selector).attr('disabled', 'disabled');
					} else {
						$(device.selector).on('change', function() {
							var index = $(this).val();
							midi_controller.selectDevice(type, index);
						});
					}
					$(device.selector).css('width', '100%');
				});

				$('#refresh_midi_devices').on('click', function() {
					midi_controller.scanDevices();
					midi_controller.detectDevices();
				});
			});
			midi_controller.detectDevices();
		},
		init: function() {
			var keyboard = new PianoKeyboard();
			var midi_notes = new MidiNotes();
			var midi_controller = new MidiController({ midiNotes: midi_notes });
			var notation = new Notation({ midiNotes: midi_notes });

			this.initOnScreenPiano(keyboard);
			this.initNotation(notation);
			this.initTabs();
			this.initKeyboardSizes(keyboard);
			this.initPedals();
			this.initInstruments();
			this.initKeyAndSignature(notation);
			this.initDevices(midi_controller);
		}
	};

	$(document).ready(function() {
		setup.init();
	});
});
