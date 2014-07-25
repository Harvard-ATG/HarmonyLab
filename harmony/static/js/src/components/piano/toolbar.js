define([
	'jquery', 
	'lodash',
	'app/components/events',
	'app/components/component',
	'./metronome'
], function(
	$,
	_,
	EVENTS,
	Component,
	MetronomeComponent
) {

	/**
	 * ToolbarComponent renders the toolbar element of the on-screen piano.
	 *
	 * @param {object} settings
	 * @param {boolean} settings.metronome when true, enables the metronome
	 * @constructor
	 */
	var ToolbarComponent = function(settings) {
		this.settings = settings || {};
		if("metronome" in this.settings && this.settings.metronome === true) {
			this.setComponent("metronome", new MetronomeComponent());
		}
	};

	ToolbarComponent.prototype = new Component();

	ToolbarComponent.prototype.initComponent = function() {
		if(this.hasComponent("metronome")) {
			this.initMetronome();
		}
	};

	/**
	 * Initializes the metronome component.
	 * 
	 * @return undefined
	 */
	ToolbarComponent.prototype.initMetronome = function() {
		var metronome = this.getComponent("metronome");
		var that = this;

		metronome.bind("bank", function() {
			that.broadcast(EVENTS.BROADCAST.BANK_NOTES);
		});
		metronome.bind("change", function() {
			that.broadcast(EVENTS.BROADCAST.METRONOME, metronome.getMetronome());
		});

		this.subscribe(EVENTS.BROADCAST.TOGGLE_METRONOME, metronome.toggle);
	};

	/**
	 * Renders the component.
	 *
	 * @return this
	 */
	ToolbarComponent.prototype.render = function() {
		this.el = $( '<div class="keyboard-controls"></div>');
		_.invoke(this.components, "render");
		this.el.append(_.pluck(this.components, "el"));
		return this;
	};

	return ToolbarComponent;
});
