define([
	'jquery', 
	'lodash',
	'app/model/event_bus',
	'app/presenter/metronome',
	'app/view/piano/piano_keyboard'
], function(
	$,
	_,
	eventBus,
	Metronome,
	PianoKeyboard
) {
	"use strict";

	// Responsible for displaying the on-screen piano and reacting to
	// user-input. Should know how to display different sizes of keyboards,
	// pedals, and keyboard controls.
	var Piano = function() {
		this.init();
	};

	_.extend(Piano.prototype, {
		metronomeEnabled: true,
		transposeEnabled: false,
		eventBus: eventBus,
		init: function() {
			this.el = $('<div class="keyboard-wrapper"></div>');
			this.initKeyboard();
			this.initPedals();
			this.initToolbar();
		},
		initKeyboard: function() {
			this.keyboard = new PianoKeyboard();
		},
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
		initToolbar: function() {
			this.toolbarEl = $('<div class="keyboard-controls"></div>');

			if(this.metronomeEnabled) {
				this.initMetronomeControl();
			}
			if(this.transposeEnabled) {
				this.initTransposeControl();
			}
		},
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
		initMetronomeControl: function() {
			var toolbarEl = this.toolbarEl;
			var eventBus = this.eventBus;

			var $metronomeInputEl; 
			var $metronomeLedEl; 
			var metronome;
			var metronomeLedCls = 'metronome-led-on';
			var metronome_tpl = _.template([
				'<div class="metronome-control">',
					'<div style="float:right" class="metronome-icon js-metronome-btn"></div>',
					'<input style="float:right" name="bpm" type="text" class="metronome-control-input js-metronome-input" value="" maxlength="3" />',
					'<div style="float:right" class="metronome-led"></div>',
				'</div>'
			].join(''));

			toolbarEl.append(metronome_tpl());

			$metronomeInputEl = $('.js-metronome-input', toolbarEl);
			$metronomeLedEl = $('.metronome-led', toolbarEl);

			metronome = new Metronome($('#metronome-audio')[0]);
			metronome.bind('tick', function() {
				$metronomeLedEl.toggleClass(metronomeLedCls);
			});


			toolbarEl.on('click', '.js-metronome-btn', null, function(ev) {
				var active_cls = 'metronome-icon-active';
				var is_playing = metronome.isPlaying();
				var $btn = $(ev.target);

				if(is_playing) {
					metronome.stop();
					$btn.removeClass(active_cls);
					$metronomeLedEl.removeClass(metronomeLedCls);
				} else {
					metronome.start();
					$btn.addClass(active_cls);
					$metronomeInputEl.val(metronome.getTempo());
				}

				eventBus.trigger("metronome", metronome);
			});

			toolbarEl.on('change', '.js-metronome-input', null, function(ev) {
				var tempo = parseInt($(ev.target).val(), 10);
				if(metronome.changeTempo(tempo)) {
					eventBus.trigger("metronome", metronome);
				}
			});
		},
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
		calculateNewWidth: function(old_keyboard, new_keyboard) {
			// assumes the old keyboard is still part of the DOM and has layout
			var offset = old_keyboard.keyboardEl.position();
			var total_margin = 2 * offset.left;

			return new_keyboard.width + total_margin;
		},
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
