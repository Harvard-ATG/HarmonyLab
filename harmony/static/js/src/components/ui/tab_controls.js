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
	 * Defines a namespace for setting up tab behavior around the notation
	 * canvas.
	 *
	 * @namespace
	 */
	var TabControlsComponent = function(settings) {
		this.settings = settings || {};
		if(!("keySignature" in settings)) {
			throw new Error("missing keySignature setting");
		}
		if(!("midiDevice" in settings)) {
			throw new Error("missing midiDevice setting");
		}
		this.keySignature = settings.keySignature;
		this.midiDevice = settings.midiDevice;

		this.addComponent(new ModalComponent());

		_.bindAll(this, ['initTab', 'onClickToggleTabs', 'onClickInfo']);
	};

	TabControlsComponent.prototype = new Component();

	_.extend(TabControlsComponent.prototype, {
		/**
		 * Holds the tab elements.
		 * @type {array}
		 */
		tabElements: [],
		/**
		 * Flag to indicate if tabs are all expanded or not.
		 * @type {boolean}
		 */
		tabsExpanded: false,
		/**
		 * Initializes the tab expand/collapse behavior and other buttons.
		 *
		 * @return undefined
		 */
		initComponent: function() {

			$('.js-tab').each(this.initTab);
			$('.js-toggle-tabs')
				.on('mousedown', this.cancelEvent) // fixes issue with unwated text selections on click
				.on('click', this.onClickToggleTabs); // handles the expand/collapse behavior we want
			
			$('.js-btn-screenshot').on('mousedown', this.onClickScreenshot);
			$('.js-btn-info').on('click', this.onClickInfo);
		},
		/**
		 * Initializes each tab so it can expand/collapse.
		 *
		 * @param {number} index
		 * @param {object} el
		 * @return undefined
		 */
		initTab: function(index, el) {
			var $el = $(el);
			var tab = {
				'el': $el,
				'animEl': $el.parent(),
				'contentEl': $el.next().children(".tab-content-inner"),
				'width': $el.next().width(),
				'expanded': false
			};

			if($el.hasClass('js-tab-left')) {
				tab.expand = this.makeExpander(tab, '-=', true);
				tab.collapse = this.makeExpander(tab, '+=', false);
			} else {
				tab.expand = this.makeExpander(tab, '+=', true);
				tab.collapse = this.makeExpander(tab, '-=', false);
			}

			$el.on('click', function(ev) {
				tab[tab.expanded?'collapse':'expand']();
				return false;
			});

			this.initTabContent(tab);
			this.tabElements.push(tab);
		},
		/**
		 * Initializes the content of the tab.
		 *
		 * @param {object} tab 
		 * @return undefined
		 */
		initTabContent: function(tab) {
			var initializer_for = {
				"instruments": "initInstrumentsTab",
				"midi": "initMidiTab",
				"keysignature": "initKeySignatureTab",
				"notation": "initNotationTab"
			};

			var tab_name = tab.el.data('tab-name');
			var method = '';

			if(initializer_for[tab_name]) {
				method = initializer_for[tab_name];
				this[method](tab);
			}
		},
		/**
		 * Initializes the content of the instruments tab.
		 *
		 * @param {object} tab
		 * @return undefined
		 */
		initInstrumentsTab: function(tab) {
			this.renderInstrumentSelect(tab);
			this.renderKeyboardSizeSelect(tab);
			this.renderKeyboardShortcuts(tab);
		},
		/**
		 * Initializes the content of the midi tab.
		 *
		 * @param {object} tab
		 * @return undefined
		 */
		initMidiTab: function(tab) {
			var renderDevices = function(midiDevice) {
				var inputs = midiDevice.getInputs();
				var outputs = midiDevice.getOutputs();
				var tpl = _.template('<option value="<%= id %>"><%= name %></option>');
				var makeOptions = function(device, idx) {
					return tpl({ id: idx, name: device.deviceName });
				};
				var devices = {
					'input': {
						'selector': $('.js-select-midi-input', tab.contentEl),
						'options': _.map(inputs, makeOptions)
					},
					'output': {
						'selector': $('.js-select-midi-output', tab.contentEl),
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
					$(device.selector).css('width', '100%');
				});

			};

			$('.js-refresh-midi-devices', tab.contentEl).on('click', this.midiDevice.update);

			this.midiDevice.bind("updated", renderDevices);

			renderDevices(this.midiDevice);
		},
		/**
		 * Initializes the content of the key signature tab.
		 *
		 * @param {object} tab
		 * @return undefined
		 */
		initKeySignatureTab: function(tab) {
			var el = $('.js-keysignature-widget', tab.contentEl); 
			var widget = new KeySignatureWidget(this.keySignature);
			widget.render();
			el.append(widget.el);
		},
		/**
		 * Initializes the content of the notation tab.
		 *
		 * @param {object} tab
		 * @return undefined
		 */
		initNotationTab: function(tab) {
			var that = this;
			var el = $('.js-analyze-widget', tab.contentEl);
			var analyze_widget = new AnalyzeWidget();
			var highlight_widget = new HighlightWidget();
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
		 * @param {object} tab
		 * @return undefined
		 */
		renderInstrumentSelect: function(tab) {
			var that = this;
			var el = $('.js-instrument', tab.contentEl);
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
		 * @param {object} tab
		 * @return undefined
		 */
		renderKeyboardSizeSelect: function(tab) {
			var that = this;
			var el = $('.js-keyboardsize', tab.contentEl);
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

			el.append(selectEl).wrapInner("<label>Keyboard size:</label>");
		},
		/**
		 * Renders the keyboard shorcuts.
		 *
		 * @param {object} tab
		 * @return undefined
		 */
		renderKeyboardShortcuts: function(tab) {
			var that = this;
			var el = $('.js-keyboardshortcuts', tab.contentEl);

			// toggle shortcuts on/off via gui control
			el.attr('checked', KEYBOARD_SHORTCUTS_ENABLED);
			el.on('change', function() {
				var toggle = $(this).is(':checked') ? true : false;
				that.broadcast(EVENTS.BROADCAST.TOGGLE_SHORTCUTS, toggle);
				$(this).blur(); // trigger blur so it loses focus
			});

			// update gui control when toggled via ESC key
			this.subscribe(EVENTS.BROADCAST.TOGGLE_SHORTCUTS, function(enabled) {
				el[0].checked = enabled;
			});
		},
		/**
		 * Expands or collapses *all* tabs.
		 *
		 * @param {object} evt
		 * @return {boolean} false
		 */
		onClickToggleTabs: function(evt) {
			var el = evt.target;
			var cls = ['icon-btn-open','icon-btn-close'];
			var tabsExpanded = this.tabsExpanded;

			if($(el).hasClass('icon-btn-close')) {
				cls.reverse();
			}

			$(el).removeClass(cls[0]).addClass(cls[1]);

			$.each(this.tabElements, function(index, tab) {
				tab[tabsExpanded?'collapse':'expand']();
			});

			this.tabsExpanded = !tabsExpanded;

			return false;
		},
		/**
		 * Handler to generate a screenshot/image of the staff area.
		 *
		 * @param {object} evt
		 * @return {boolean} true
		 */
		onClickScreenshot: function(evt) {
			// TODO: why is this here? nothing to do wih tabs
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
			// TODO: why is this here? nothing to do with tabs 
			this.trigger("modal", {title: APP_INFO_TITLE, content: APP_INFO_CONTENT});
			return false;
		},
		/**
		 * Utility function that returns a function to expand or collapse a tab.
		 *
		 * @param {object} tab
		 * @param {string} dir '+=' or '-='
		 * @param {boolean} expand 
		 * @return {function}
		 */
		makeExpander: function(tab, dir, expand) {
			var animOpts = {marginLeft: dir + tab.width};
			return function() {
				if(tab.expanded !== expand) {
					tab.animEl.animate(animOpts, 0, 'swing', function() {
						tab.el[expand?'addClass':'removeClass']('expanded');
						tab.expanded = expand;
					});
				}
				return false;
			};
		},
		/**
		 * Utility function to cancel an event.
		 *
		 * @param evt
		 * @return {boolean} false
		 */
		cancelEvent: function(evt) {
			return false;
		}
	});

	return TabControlsComponent;
});
