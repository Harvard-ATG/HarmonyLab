define([
	'jquery', 
	'lodash',
	'app/model/event_bus',
	'app/view/piano/piano_keyboard'
], function(
	$,
	_,
	eventBus,
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
			console.log("initPedals");
			var eventBus = this.eventBus;
			var pedalNameByIndex = ['soft','sostenuto','sustain'];
			var pedals = {
				'soft': {},
				'sostenuto' : {},
				'sustain' : {},
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
			var metronome = [
				'<div class="metronome-control">',
					'<div style="float:right" class="metronome-icon"> </div>',
					'<input name="bpm" type="text" class="metronome-control-input" />',
				'</div>'
			].join('');

			var transpose = [
				'<div class="transpose-control">',
					'<div style="float:left" class="transpose-icon"> </div>',
					'<select name="tranpose_num">',
						'<option value="3">+3</option>',
						'<option value="2">+2</option>',
						'<option value="1">+1</option>',
						'<option value="0" selected>-0-</option>',
						'<option value="-1">-1</option>',
						'<option value="-2">-2</option>',
						'<option value="-3">-3</option>',
					'</select>',
				'</div>'
			].join('');

			this.toolbarEl = $('<div class="keyboard-controls"></div>');
			this.toolbarEl.append(metronome, transpose);
		},
		changeKeyboard: function(size) {
			var new_keyboard, new_width, offset;
			if(this.keyboard.getNumKeys() == size) {
				return;
			}

			new_keyboard = new PianoKeyboard(size).render();
			offset = this.keyboard.keyboardEl.position();
			new_width = new_keyboard.width + (2 * offset.left);

			this.keyboard.destroy();
			this.el.width(new_width);
			new_keyboard.el.insertBefore(this.pedalsEl);

			this.keyboard = new_keyboard;
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
