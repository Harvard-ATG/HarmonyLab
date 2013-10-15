/* global define: false */
define([
	'lodash',
	'jquery', 
	'app/model/chord_bank',
	'app/model/event_bus',
	'app/model/key_signature',
	'app/view/transcript',
	'app/view/piano',
	'app/view/widget/analyze_widget',
	'app/view/widget/highlight_widget',
	'app/view/widget/key_signature_widget',
	'app/view/widget/theme_selector_widget',
	'app/presenter/midi_source',
	'app/presenter/keyboard_shortcuts',
	'app/presenter/notation_tabs',
	'app/util/instruments'
], 
function(
	_,
	$,
	ChordBank,
	eventBus,
	KeySignature,
	Transcript,
	Piano,
	AnalyzeWidget,
	HighlightWidget,
	KeySignatureWidget,
	ThemeSelectorWidget,
	MidiSource,
	KeyboardShortcuts,
	NotationTabs,
	Instruments
) {
	"use strict";

	/**
	 * This defines a namespace for initialization methods for separate UI
	 * components.
	 *
	 * @namespace
	 */
	var setup = {
		/**
		 * Initializes the on-screen piano.
		 *
		 * @param {Piano} piano
		 * @return undefined
		 */
		initOnScreenPiano: function(piano) {
			$('#piano').append(piano.render().el);
		},
		/**
		 * Initializes the transcript.
		 *
		 * @param {Transcript} transcript
		 * @return undefined
		 */
		initTranscript: function(transcript) {
			$('#staff-area').append(transcript.render().el);
		},
		/**
		 * Initializes the tab navigation.
		 *
		 * @return undefined
		 */
		initTabs: function() {
			// activate the tab menus around the staff area
			NotationTabs.init();
		},
		/**
		 * Initializes the MIDI instrument selection UI control.
		 *
		 * @return undefined
		 */
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
		/**
		 * Initializes the keyboard size selection UI control.
		 *
		 * @param {Piano} piano
		 * @return undefined
		 */
		initKeyboardSizes: function(piano) {
			$('#select_keyboard_size').on('change', function() {
				var size = parseInt($(this).val(), 10);
				piano.changeKeyboard(size);
			});
		},
		/**
		 * Initializes the notation tab that contains the analysis and highlight
		 * UI controls.
		 *
		 * @return undefined
		 */
		initNotationWidget: function() {
			var highlight_widget = new HighlightWidget();
			var analyze_widget = new AnalyzeWidget();

			$('#notation_widget').append(highlight_widget.render().el);
			$('#notation_widget').append(analyze_widget.render().el);

			var event_for = {
				highlight:'notation:highlight',
				analyze:'notation:analyze'
			};

			var onChangeCategory = function(category, enabled) {
				if(event_for[category]) {
					eventBus.trigger(event_for[category], {key: "enabled", value: enabled});
				}
			};

			var onChangeOption = function(category, mode, enabled) {
				var value = {};
				if(event_for[category]) {
					value[mode] = enabled;
					eventBus.trigger(event_for[category], {key: "mode", value: value});
				}
			};

			highlight_widget.bind('changeCategory', onChangeCategory);
			highlight_widget.bind('changeOption', onChangeOption);
			analyze_widget.bind('changeCategory', onChangeCategory);
			analyze_widget.bind('changeOption', onChangeOption);
		},
		/**
		 * Initializes the key signature widget.
		 *
		 * @param {KeySignature} keySignature
		 * @return undefined
		 */
		initKeyAndSignature: function(keySignature) {
			var widget = new KeySignatureWidget(keySignature);
			$('#key_signature_widget').append(widget.render().el);
		},
		/**
		 * Initializes the MIDI device selection UI control.
		 *
		 * @param {MidiSource} midiSource
		 * @return undefined
		 */
		initDevices: function(midiSource) {
			midiSource.bind('devices', function(inputs, outputs, defaults) {
				var tpl = _.template('<option value="<%= id %>"><%= name %></option>');
				var makeOptions = function(device, idx) {
					return tpl({ id: idx, name: device.deviceName });
				};
				var devices = {
					'input': {
						'selector': '#select_midi_input',
						'options': _.map(inputs, makeOptions)
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
							midiSource.selectDevice(type, index);
						});
					}
					$(device.selector).css('width', '100%');
				});

				$('#refresh_midi_devices').on('click', function() {
					midiSource.scanDevices();
					midiSource.detectDevices();
				});
			});
			midiSource.detectDevices();
		},
		/**
		 * Initializes keyboard shortcuts.
		 *
		 * @param shortcuts
		 * @return undefined
		 */
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
		/**
		 * Initializes the theme selector UI control.
		 *
		 * @return undefined
		 */
		initThemeSelector: function() {
			var themeSelector = new ThemeSelectorWidget('#theme-select', '#container');
			themeSelector.render();
		},
		/**
		 * Initializes the user interface.
		 *
		 * This method should be called when the DOM is ready.
		 *
		 * @return undefined
		 */
		init: function() {
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
			var piano = new Piano();

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

	_.bindAll(setup, ['init']);

	/**
	 * Initialize the UI when the DOM is ready.
	 */
	$(document).ready(setup.init);
});
