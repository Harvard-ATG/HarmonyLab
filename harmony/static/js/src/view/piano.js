define([
	'jquery', 
	'lodash',
	'app/model/event_bus',
	'app/view/piano/piano_keyboard',
	'app/view/piano/piano_metronome'
], function(
	$,
	_,
	eventBus,
	PianoKeyboard,
	PianoMetronome
) {
	"use strict";

	/**
	 * Creates an instance of a Piano.
	 *
	 * The Piano object is responsible for displaying the on-screen piano and
	 * its subcomponents such as the keyboard, pedals, and controls (metronome,
	 * etc) and react to input events.
	 *
	 * @constructor
	 */
	var Piano = function() {
		this.init();
	};

	_.extend(Piano.prototype, {
		/**
		 * Flag to indicate if the metronome control is enabled.
		 * @type {boolean} 
		 * @default true
		 */
		metronomeEnabled: true,
		/**
		 * Flag to indicate if the transpose control is enabled.
		 * @type {boolean}
		 * @default false
		 */
		transposeEnabled: false,
		/**
		 * Global event bus.
		 * @type {object}
		 */
		eventBus: eventBus,
		/**
		 * Initializes the piano.
		 *
		 * @return undefined
		 */
		init: function() {
			this.el = $('<div class="keyboard-wrapper"></div>');
			this.initKeyboard();
			this.initPedals();
			this.initToolbar();
		},
		/**
		 * Initializes the keyboard UI.
		 *
		 * @return undefined
		 */
		initKeyboard: function() {
			this.keyboard = new PianoKeyboard();
		},
		/**
		 * Initializes the pedals UI.
		 *
		 * @todo Refactor into a sub-component like PianoKeyboard.
		 * @return undefined
		 */
		initPedals: function() {
			var eventBus = this.eventBus;
			var pedalNameByIndex = ['soft','sostenuto','sustain'];
			var pedals = {
				'soft': {},
				'sostenuto' : {},
				'sustain' : {}
			};

			this.pedalsEl = $([
				'<div class="keyboard-pedals">',
					'<div class="pedal pedal-left"></div>',
					'<div class="pedal pedal-center"></div>',
					'<div class="pedal pedal-right"></div>',
				'</div>'
			].join(''));


			$('.pedal', this.pedalsEl).each(function(index, el) {
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
		/**
		 * Initializes the piano toolbar that contains the controls.
		 *
		 * @return undefined
		 */
		initToolbar: function() {
			this.toolbarEl = $('<div class="keyboard-controls"></div>');

			if(this.metronomeEnabled) {
				this.initMetronomeControl();
			}
			if(this.transposeEnabled) {
				this.initTransposeControl();
			}
		},
		/**
		 * Initializes the transpose control.
		 *
		 * @todo refactor into subcomponent
		 * @return undefined
		 */
		initTransposeControl: function() {
			var toolbarEl = this.toolbarEl;
			var eventBus = this.eventBus;

			var transpose_tpl = _.template([
				'<div class="transpose-control">',
					'<div style="float:left" class="transpose-icon"> </div>',
					'<select name="tranpose_num" class="js-transpose">',
						'<% _.forEach(transposeOpts, function(opt) { %>',
							'<option value="<%= opt.val %>" <% print(opt.selected ? "selected" : ""); %>><%= opt.name %></option>',
						'<% }); %>',
					'</select>',
				'</div>'
			].join(''));

			var transposeOpts =  _.map(_.range(-12, 13), function(n) {
				return { val: n, selected: n === 0, name: (n > 0 ? '+' : '') + n };
			});

			var html = transpose_tpl({ transposeOpts: transposeOpts});

			toolbarEl.append(html);
			toolbarEl.on('change', '.js-transpose', null, function(ev) {
				var transpose = parseInt($(ev.target).val(), 10);
				eventBus.trigger('transpose', transpose);
			});
		},
		/**
		 * Initializes the metronome control
		 *
		 * @return undefined
		 */
		initMetronomeControl: function() {
			var eventBus = this.eventBus;
			var metronomeControl = new PianoMetronome();

			// Trigger a chord "bank" on the off-beats (per Rowland)
			metronomeControl.bind("offbeat", function() {
				eventBus.trigger("banknotes");
			});

			// Relay metronome changes to the rest of the app
			metronomeControl.bind("change", function() {
				eventBus.trigger("metronome", metronomeControl.getMetronome());
			});

			// Handles external commands to toggle the metronome (i.e. keyboard
			// shortcuts)
			eventBus.bind("togglemetronome", metronomeControl.toggle);

			// Adds the control to the toolbar
			this.toolbarEl.append(metronomeControl.render().el);

			this.metronomeControl = metronomeControl;
		},
		/**
		 * Changes the keyboard size.
		 *
		 * @param {number} size The number of keys the keyboard should have.
		 * @return undefined
		 */
		changeKeyboard: function(size) {
			if(this.keyboard.getNumKeys() == size) {
				return;
			}

			var old_keyboard = this.keyboard;
			var new_keyboard = new PianoKeyboard(size);
			new_keyboard.render();

			// set the container width to match the size of the new keyboard
			this.el.width(this.calculateNewWidth(old_keyboard, new_keyboard));

			// destroy the old keyboard and insert the new one
			old_keyboard.destroy();
			new_keyboard.el.insertBefore(this.pedalsEl);

			// save a reference to the new keyboard
			this.keyboard = new_keyboard;
		},
		/**
		 * Calculates the width of the new keyboard.
		 *
		 * @param {PianoKeyboard} old_keyboard
		 * @param {PianoKeyboard} new_keyboard
		 * @return {number}
		 */
		calculateNewWidth: function(old_keyboard, new_keyboard) {
			// assumes the old keyboard is still part of the DOM and has layout
			var offset = old_keyboard.keyboardEl.position();
			var total_margin = 2 * offset.left;

			return new_keyboard.width + total_margin;
		},
		/**
		 * Renders the piano.
		 *
		 * @return this
		 */
		render: function() {
			this.keyboard.render();
			this.el.append(this.toolbarEl);
			this.el.append(this.keyboard.el);
			this.el.append(this.pedalsEl);
			return this;
		}
	});

	return Piano;
});
