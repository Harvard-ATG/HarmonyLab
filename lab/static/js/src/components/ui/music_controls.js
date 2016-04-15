define([
	'jquery', 
	'lodash', 
	'app/config',
	'app/components/events',
	'app/components/component',
	'app/components/ui/modal',
	'app/utils/instruments',
	'app/widgets/key_signature',
	'app/widgets/analyze',
	'app/widgets/highlight'
], function(
	$, 
	_, 
	Config, 
	EVENTS,
	Component,
	ModalComponent,
	Instruments,
	KeySignatureWidget,
	AnalyzeWidget,
	HighlightWidget
) {

	/**
	 * Defines the title of the app info modal.
	 * @type {string}
	 * @const
	 */
	var APP_INFO_TITLE = Config.get('helpText.appInfo.title');
	/**
	 * Defines the content of the app info modal.
	 * @type {string}
	 * @const
	 */
	var APP_INFO_CONTENT = Config.get('helpText.appInfo.content');
	/**
	 * Defines whether the shortcuts are enabled by default or not.
	 * @type {boolean}
	 * @const
	 */
	var KEYBOARD_SHORTCUTS_ENABLED = Config.get('general.keyboardShortcutsEnabled');
	/**
	 * Defines the default keyboard size.
	 * @type {number}
	 * @const
	 */
	var DEFAULT_KEYBOARD_SIZE = Config.get('general.defaultKeyboardSize');

	/**
	 * Defines a namespace for settings.
	 * canvas.
	 *
	 * @namespace
	 */
	var MusicControlsComponent = function(settings) {
		this.settings = settings || {};
		if(!("keySignature" in settings)) {
			throw new Error("missing keySignature setting");
		}
		if(!("midiDevice" in settings)) {
			throw new Error("missing midiDevice setting");
		}
		this.keySignature = settings.keySignature;
		this.midiDevice = settings.midiDevice;

		if(settings.exerciseContext) { 
			this.exerciseContext = settings.exerciseContext;
		} else {
			this.exerciseContext = false;
		}

		this.addComponent(new ModalComponent());
		
		this.headerEl = $(settings.headerEl);
		this.containerEl = $(settings.containerEl);

		_.bindAll(this, ['onClickInfo']);
	};

	MusicControlsComponent.prototype = new Component();

	_.extend(MusicControlsComponent.prototype, {
		/**
		 * Initializes the component.
		 *
		 * @return undefined
		 */
		initComponent: function() {

			$('.js-btn-help', this.headerEl).on('click', this.onClickInfo);
			$('.js-btn-screenshot').on('mousedown', this.onClickScreenshot);

			this.initControlsLayout();
			this.initKeySignatureTab();
			this.initNotationTab();
			this.renderInstrumentSelect();
			this.renderKeyboardSizeSelect();
			this.renderKeyboardShortcuts();
			this.initMidiTab();
		},
		/**
		 * Initializes the controls layout. 
		 * 
		 * @return undefined
		 */
		initControlsLayout: function() {
			this.containerEl.children(".accordion").accordion({
				active: false,
				collapsible: true,
				heightStyle: "content"
			});
		},
		/**
		 * Initializes the content of the midi.
		 *
		 * @return undefined
		 */
		initMidiTab: function() {
			var containerEl = this.containerEl;
			var renderDevices = function(midiDevice) {
				var inputs = midiDevice.getInputs();
				var outputs = midiDevice.getOutputs();
				var tpl = _.template('<option value="<%= id %>"><%= name %></option>');
				var makeOptions = function(device, idx) {
					return tpl({ id: idx, name: device.deviceName });
				};
				var devices = {
					'input': {
						'selector': $('.js-select-midi-input', containerEl),
						'options': _.map(inputs, makeOptions)
					},
					'output': {
						'selector': $('.js-select-midi-output', containerEl),
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
							var index = parseInt($(this).val(), 10);
							midiDevice[type=='input'?'selectInput':'selectOutput'](index);
						});
					}
				});

			};

			$('.js-refresh-midi-devices', containerEl).on('click', this.midiDevice.update);

			this.midiDevice.bind("updated", renderDevices);

			renderDevices(this.midiDevice);
		},
		/**
		 * Initializes the content of the key signature.
		 *
		 * @return undefined
		 */
		initKeySignatureTab: function() {
			var containerEl = this.headerEl;
			var el = $('.js-keysignature-widget', containerEl); 
			var widget = new KeySignatureWidget(this.keySignature);
			widget.render();
			el.append(widget.el);
		},
		/**
		 * Initializes the content of the notation containerEl.
		 *
		 * @return undefined
		 */
		initNotationTab: function() {
			var that = this;
			var containerEl = this.containerEl;
			var el = $('.js-analyze-widget', containerEl);
			var analysisSettings = {};
			var highlightSettings = {};
			if(this.exerciseContext) {
				analysisSettings = this.exerciseContext.getDefinition().getAnalysisSettings();
				highlightSettings = this.exerciseContext.getDefinition().getHighlightSettings();
			}
			var analyze_widget = new AnalyzeWidget(analysisSettings);
			var highlight_widget = new HighlightWidget(highlightSettings);
			var event_for = {
				'highlight': EVENTS.BROADCAST.HIGHLIGHT_NOTES,
				'analyze': EVENTS.BROADCAST.ANALYZE_NOTES
			};
			var onChangeCategory = function(category, enabled) {
				if(event_for[category]) {
					that.broadcast(event_for[category], {key: "enabled", value: enabled});
				}
			};
			var onChangeOption = function(category, mode, enabled) {
				var value = {};
				if(event_for[category]) {
					value[mode] = enabled;
					that.broadcast(event_for[category], {key: "mode", value: value});
				}
			};

			highlight_widget.bind('changeCategory', onChangeCategory);
			highlight_widget.bind('changeOption', onChangeOption);

			analyze_widget.bind('changeCategory', onChangeCategory);
			analyze_widget.bind('changeOption', onChangeOption);

			analyze_widget.render();
			highlight_widget.render();

			el.append(highlight_widget.el, analyze_widget.el);
		},
		/**
		 * Renders the instrument selector.
		 *
		 * @return undefined
		 */
		renderInstrumentSelect: function() {
			var that = this;
			var containerEl = this.containerEl;
			var el = $('.js-instrument', containerEl);
			var selectEl = $("<select/>");
			var tpl = _.template('<% _.forEach(instruments, function(inst) { %><option value="<%= inst.num %>"><%- inst.name %></option><% }); %>');
			var options = tpl({ instruments: Instruments.getEnabled() });

			selectEl.append(options);
			selectEl.on('change', function() {
				var instrument_num = $(this).val();
				that.broadcast(EVENTS.BROADCAST.INSTRUMENT, instrument_num);
			});
			
			el.append(selectEl);
		},
		/**
		 * Renders the keyboard size selector.
		 *
		 * @return undefined
		 */
		renderKeyboardSizeSelect: function() {
			var that = this;
			var containerEl = this.containerEl;
			var el = $('.js-keyboardsize', containerEl);
			var selectEl = $("<select/>");
			var tpl = _.template('<% _.forEach(sizes, function(size) { %><option value="<%= size %>"><%- size %></option><% }); %>');
			var options = tpl({sizes: [25,37,49,88]})
			var selected = DEFAULT_KEYBOARD_SIZE;

			selectEl.append(options);
			selectEl.find("[value="+selected+"]").attr("selected", "selected");
			selectEl.on('change', function() {
				var size = parseInt($(this).val(), 10);
				that.broadcast(EVENTS.BROADCAST.KEYBOARD_SIZE, size);
			});

			el.append(selectEl).wrapInner("<label>&emsp;Number of keys: </label>");
		},
		/**
		 * Renders the keyboard shorcuts.
		 *
		 * @return undefined
		 */
		renderKeyboardShortcuts: function() {
			var that = this;
			var containerEl = this.containerEl;
			var el = $('.js-keyboardshortcuts', containerEl);
			var inputEl = $('<input type="checkbox" name="keyboard_shortcuts" value="on" />');
			el.append("&emsp;Enable QWERTY shortcuts? ").append(inputEl).wrap("<label/>");

			// toggle shortcuts on/off via gui control
			inputEl.attr('checked', KEYBOARD_SHORTCUTS_ENABLED);
			inputEl.on('change', function() {
				var toggle = $(this).is(':checked') ? true : false;
				that.broadcast(EVENTS.BROADCAST.TOGGLE_SHORTCUTS, toggle);
				$(this).blur(); // trigger blur so it loses focus
			});

			// update gui control when toggled via ESC key
			this.subscribe(EVENTS.BROADCAST.TOGGLE_SHORTCUTS, function(enabled) {
				inputEl[0].checked = enabled;
			});
		},
		/**
		 * Handler to generate a screenshot/image of the staff area.
		 *
		 * @param {object} evt
		 * @return {boolean} true
		 */
		onClickScreenshot: function(evt) {
			var $canvas = $('#staff-area canvas');
			var $target = $(evt.target);
			var data_url = $canvas[0].toDataURL();
			$target[0].href = data_url;
			$target[0].target = '_blank';
			return true;
		},
		/**
		 * Handler to shows the info modal.
		 *
		 * @param {object} evt
		 * @return {boolean} false
		 */
		onClickInfo: function(evt) {
			this.trigger("modal", {title: APP_INFO_TITLE, content: APP_INFO_CONTENT});
			return false;
		}
	});

	return MusicControlsComponent;
});
