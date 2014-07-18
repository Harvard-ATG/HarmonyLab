define([
	'jquery', 
	'lodash',
	'app/components/events',
	'app/components/component'
], function(
	$,
	_,
	EVENTS,
	Component
) {

	/**
	 * The PedalsComponent renders pedals for the on-screen piano.
	 */
	var PedalsComponent = function() {};

	PedalsComponent.prototype = new Component();

	PedalsComponent.prototype.initComponent = function() {
		_.bindAll(this, ['setupPedalEl', 'onPedalChange']);

		this.pedals = {};
		this.pedalNameByIndex = [];

		_.each(['soft','sostenuto','sustain'], function(name, index) {
			this.pedals[name] = {};	
			this.pedalNameByIndex[index] = name;
		}, this);
	};

	PedalsComponent.prototype.render = function() {
		this.el = $([
			'<div class="keyboard-pedals">',
				'<div class="pedal pedal-left"></div>',
				'<div class="pedal pedal-center"></div>',
				'<div class="pedal pedal-right"></div>',
			'</div>'
		].join(''));

		$('.pedal', this.el).each(this.setupPedalEl);

		this.subscribe(EVENTS.BROADCAST.PEDAL, this.onPedalChange);

		return this;
	};

	PedalsComponent.prototype.setupPedalEl = function(index, el) {
		var component = this;
		var name = this.pedalNameByIndex[index];
		var pedal = this.pedals[name];

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
			component.broadcast(EVENTS.BROADCAST.PEDAL, name, pedal.state);
		});
	};

	PedalsComponent.prototype.onPedalChange = function(pedal, state) {
		var p = this.pedals[pedal];
		if(p) {
			p.toggle(state);
		}
	};

	return PedalsComponent;
});
