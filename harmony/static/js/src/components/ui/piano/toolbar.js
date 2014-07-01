define([
	'jquery', 
	'lodash',
	'app/components/component',
	'./metronome'
], function(
	$,
	_,
	Component,
	MetronomeComponent
) {

	var ToolbarComponent = function() {
		this.setComponent("metronome", new MetronomeComponent());
	};

	ToolbarComponent.prototype = new Component();

	ToolbarComponent.prototype.initComponent = function() {
		this.initMetronome();
	};

	ToolbarComponent.prototype.initMetronome = function() {
		var metronome = this.getComponent("metronome");
		var that = this;

		metronome.bind("bank", function() {
			that.broadcast("banknotes");
		});
		metronome.bind("change", function() {
			that.broadcast("metronome", metronome.getMetronome());
		});

		this.subscribe("togglemetronome", metronome.toggle);
	};

	ToolbarComponent.prototype.render = function() {
		this.el = $( '<div class="keyboard-controls"></div>');
		_.invoke(this.components, "render");
		this.el.append(_.pluck(this.components, "el"));
		return this;
	};

	return ToolbarComponent;
});
