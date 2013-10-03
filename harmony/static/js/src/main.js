/* global define: false */
define([
	'lodash',
	'jquery', 
	'app/model/chord_bank',
	'app/model/event_bus',
	'app/model/key_signature',
	'app/view/transcript',
	'app/view/piano',
	'app/view/widget/notation_widget',
	'app/view/widget/key_signature_widget',
	'app/view/widget/theme_selector_widget',
	'app/presenter/midi_source',
	'app/presenter/keyboard_shortcuts',
	'app/presenter/notation_tabs',
	'app/util/instruments',
], 
function(
	_,
	$,
	ChordBank,
	eventBus,
	KeySignature,
	Transcript,
	Piano,
	NotationWidget,
	KeySignatureWidget,
	ThemeSelectorWidget,
	MidiSource,
	KeyboardShortcuts,
	NotationTabs,
	Instruments
) {
	"use strict";

	// TODO: encapsulate each setup method in a presenter object
	var setup = {
		initOnScreenPiano: function(piano) {
			$('#piano').append(piano.render().el);
		},
		initTranscript: function(transcript) {
			$('#staff-area').append(transcript.render().el);
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
		initKeyboardSizes: function(piano) {
			$('#select_keyboard_size').on('change', function() {
				var size = parseInt($(this).val(), 10);
				piano.changeKeyboard(size);
			});
		},
		initNotationWidget: function() {
			var widget = new NotationWidget();
			$('#notation_widget').append(widget.render().el);

			var event_for = {
				highlight:'notation:highlight',
				analyze:'notation:analyze'
			};

			widget.bind('changeCategory', function(category, enabled) {
				if(event_for[category]) {
					eventBus.trigger(event_for[category], {key: "enabled", value: enabled});
				}
			});

			widget.bind('changeOption', function(category, mode, enabled) {
				var value = {};
				if(event_for[category]) {
					value[mode] = enabled;
					eventBus.trigger(event_for[category], {key: "mode", value: value});
				}
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
						'options': _.map(outputs, makeOptions) }
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
			var themeSelector = new ThemeSelectorWidget('#theme-select', '#container');
			themeSelector.render();
		},
		init: function() {
			var piano = new Piano();
			var chords = new ChordBank();
			var key_signature = new KeySignature();
			var midi_source = new MidiSource({ chords: chords });
			var transcript = new Transcript({ 
				chords: chords, 
				keySignature: key_signature 
			});
			var shortcuts = new KeyboardShortcuts({
				enabled: false, 
				keySignature: key_signature 
			});

			this.initTabs();
			this.initOnScreenPiano(piano);
			this.initTranscript(transcript);
			this.initKeyboardSizes(piano);
			this.initInstruments();
			this.initNotationWidget();
			this.initKeyAndSignature(key_signature);
			this.initKeyboardShortcuts(shortcuts);
			this.initDevices(midi_source);
			this.initThemeSelector();
		}
	};

	$(document).ready(_.bind(setup.init, setup));
});
