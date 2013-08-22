/* global define: false */
define([
	'lodash',
	'jquery', 
	'app/model/chord',
	'app/model/event_bus',
	'app/model/key_signature',
	'app/view/notation',
	'app/view/piano_keyboard',
	'app/presenter/midi_source',
	'app/presenter/keyboard_shortcuts',
	'app/presenter/notation_tabs',
	'app/view/key_signature',
	'app/util/instruments',
], 
function(
	_,
	$,
	Chord,
	eventBus,
	KeySignature,
	Notation,
	PianoKeyboard,
	MidiSource,
	KeyboardShortcuts,
	NotationTabs,
	KeySignatureWidget,
	Instruments
) {
	"use strict";

	var setup = {
		initOnScreenPiano: function(keyboard) {
			$('#piano').append(keyboard.render().el);
		},
		initNotation: function(notation) {
			$('#staff-area').append(notation.render().el);
		},
		initTabs: function() {
			// activate the tab menus around the staff area
			NotationTabs.init();
		},
		initInstruments: function() {
			var el = $('#select_instrument');
			var tpl = _.template('<option value="<%= num %>"><%= name %></option>');
			var enabled = Instruments.getEnabled();

			_.each(enabled, function(instrument, index) {
				el.append(tpl(instrument));
			});

			el.on('change', function() {
				var instrument_num = $(this).val();
				eventBus.trigger('instrument', instrument_num);
			});
		},
		initPedals: function() {
			var pedalNameByIndex = ['soft','sostenuto','sustain'];
			var pedals = {
				'soft': {},
				'sostenuto' : {},
				'sustain' : {},
			};

			$('#kb-pedals .pedal').each(function(index, el) {
				var name = pedalNameByIndex[index];
				var pedal = pedals[name];
	
				pedal.el = el;
				pedal.state = 'off';
				pedal.toggle = function(state) { 
					if(state) {
						this.state = state;
					} else {
						this.state = (this.state === 'on' ? 'off' : 'on');
					}
					$(this.el)[this.state=='on'?'addClass':'removeClass']('pedal-active'); 
				};

				$(el).on('click', function() {
					pedal.toggle();
					eventBus.trigger('pedal', name, pedal.state);
				});
			});

			eventBus.bind('pedal', function(pedal, state) {
				pedals[pedal].toggle(state);
			});
		},
		initKeyboardSizes: function(keyboard) {
			$('#select_keyboard_size').on('change', function() {
				var size = parseInt($(this).val(), 10);
				var new_keyboard = new PianoKeyboard(size);
				var offset = $('#piano').position();
				var new_width = new_keyboard.width + (2 * offset.left);

				new_keyboard.render();
				$('#piano').html('').append(new_keyboard.el);
				$('#kb-wrapper').width(new_width);

				keyboard.destroy();
				keyboard = new_keyboard;
			});

		},
		initKeyAndSignature: function(key_signature) {
			var widget = new KeySignatureWidget(key_signature);
			$('#key_signature_widget').append(widget.render().el);
		},
		initDevices: function(midi_source) {
			midi_source.bind('devices', function(inputs, outputs, defaults) {
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
						$(device.selector).html(device.options.join(''));
					} else {
						$(device.selector).html('<option>--</option>');
					}

					if(device.readonly) {
						$(device.selector).attr('disabled', 'disabled');
					} else {
						$(device.selector).on('change', function() {
							var index = $(this).val();
							midi_source.selectDevice(type, index);
						});
					}
					$(device.selector).css('width', '100%');
				});

				$('#refresh_midi_devices').on('click', function() {
					midi_source.scanDevices();
					midi_source.detectDevices();
				});
			});
			midi_source.detectDevices();
		},
		initKeyboardShortcuts: function(shortcuts) {
			var $shortcutsEl = $('#keyboard_shortcuts');

			// toggle shortcuts on/off via gui control
			$shortcutsEl.attr('checked', shortcuts.enabled)
				.on('change', function() {
					var toggle = $(this).is(':checked')? 'enable' : 'disable';
					shortcuts[toggle]();
				});

			// update gui control when toggled via ESC key
			shortcuts.bind('toggle', function(enabled) {
				$shortcutsEl[0].checked = enabled;
			});
		},
		initThemeSelector: function() {
			var $themeSelect = $('#theme-select');
			var themes = [];
			if($themeSelect.data('themes')) {
				themes = $themeSelect.data('themes').split(',');
			}
	
			_.each(themes, function(themeName) {
				var el = document.createElement('div');
				el.className = ['theme-thumbnail','theme-'+themeName].join(' ');
				el.setAttribute('data-theme', themeName);
				$themeSelect.append(el);
			});

			$themeSelect.delegate('.theme-thumbnail', 'click', function(ev) {
				var prefix = 'theme-';
				var $el = $(ev.target), $container = $('#container');
				var new_theme = $el.data('theme'), old_theme = $container.data('theme');

				if(new_theme !== old_theme) {
					$container.removeClass(prefix + old_theme);
					$container.addClass(prefix + new_theme);
					$container.data('theme', new_theme);
				}
			});
		},
		init: function() {
			var keyboard = new PianoKeyboard();
			var chord = new Chord();
			var key_signature = new KeySignature();
			var midi_source = new MidiSource({ chord: chord });
			var notation = new Notation({ 
				chord: chord, 
				keySignature: key_signature 
			});
			var shortcuts = new KeyboardShortcuts({
				enabled: false, 
				keySignature: key_signature 
			});

			this.initTabs();
			this.initOnScreenPiano(keyboard);
			this.initNotation(notation);
			this.initKeyboardSizes(keyboard);
			this.initPedals();
			this.initInstruments();
			this.initKeyAndSignature(key_signature);
			this.initKeyboardShortcuts(shortcuts);
			this.initThemeSelector();
			this.initDevices(midi_source);
		}
	};

	$(document).ready(_.bind(setup.init, setup));
});
