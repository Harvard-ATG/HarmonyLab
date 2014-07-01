define([
	'jquery', 
	'lodash',
	'app/components/component',
	'./piano/keyboard', 
	'./piano/pedals',
	'./piano/toolbar'
], function(
	$,
	_,
	Component,
	KeyboardComponent,
	PedalsComponent, 
	ToolbarComponent
) {

	/**
	 * Creates a PianoComponent
	 *
	 * This is responsible for displaying the on-screen piano and
	 * its subcomponents such as the keyboard, pedals, and controls.
	 *
	 * @constructor
	 */
	var PianoComponent = function(settings) {
		this.settings = settings || {};
		this.addComponent(new ToolbarComponent());
		this.addComponent(new KeyboardComponent());
		this.addComponent(new PedalsComponent());
	};

	PianoComponent.prototype = new Component();
	PianoComponent.prototype.initComponent = function() {};
	PianoComponent.prototype.render = function() {
		this.el = $('<div class="keyboard-wrapper"></div>');
		_.invoke(this.components, "render");
		this.el.append(_.pluck(this.components, "el"));
		if("renderTo" in this.settings) {
			$(this.settings.renderTo).append(this.el);
		}
		return this;
	};
	PianoComponent.prototype.changeKeyboard = function(size) {};

	return PianoComponent;
});
