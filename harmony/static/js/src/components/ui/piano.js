define([
	'jquery', 
	'lodash',
	'app/config',
	'app/components/events',
	'app/components/component',
	'./piano/keyboard', 
	'./piano/pedals',
	'./piano/toolbar'
], function(
	$,
	_,
	Config,
	EVENTS,
	Component,
	KeyboardComponent,
	PedalsComponent, 
	ToolbarComponent
) {
	/**
	 * Defines the default keyboard size.
	 * @type {number}
	 * @const
	 */
	var DEFAULT_KEYBOARD_SIZE = Config.get('general.defaultKeyboardSize');

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
		this.setComponent('toolbar', new ToolbarComponent());
		this.setComponent('keyboard', new KeyboardComponent({ numberOfKeys: DEFAULT_KEYBOARD_SIZE }));
		this.setComponent('pedals', new PedalsComponent());
		_.bindAll(this, ['onKeyboardChange']);
	};

	PianoComponent.prototype = new Component();

	PianoComponent.prototype.initComponent = function() {
		this.el = $('<div class="keyboard-wrapper"></div>');
		this.initListeners();
	};

	PianoComponent.prototype.initListeners = function() {
		this.subscribe(EVENTS.BROADCAST.KEYBOARD_SIZE, this.onKeyboardChange);
	};

	PianoComponent.prototype.removeListeners = function() {
		this.unsubscribe(EVENTS.BROADCAST.KEYBOARD_SIZE, this.onKeyboardChange);
	};

	PianoComponent.prototype.render = function() {
		this.el.empty();
		_.invoke(this.components, "render");
		this.el.append(this.getComponent('toolbar').el);
		this.el.append(this.getComponent('keyboard').el);
		this.el.append(this.getComponent('pedals').el);
		return this;
	};

	PianoComponent.prototype.renderTo = function(selector) {
		$(selector).append(this.render().el);
		this.updateWidth();
		return this;
	};

	PianoComponent.prototype.onKeyboardChange = function(size) {
		var oldKeyboardComponent = this.getComponent('keyboard');
		var newKeyboardComponent = new KeyboardComponent({numberOfKeys: size});
		newKeyboardComponent.init(this);

		this.removeComponent(oldKeyboardComponent);
		oldKeyboardComponent.destroy();

		this.setComponent('keyboard', newKeyboardComponent);
		this.render();
		this.updateWidth();
	};

	PianoComponent.prototype.updateWidth = function() {
		var keyboardComponent = this.getComponent('keyboard');
		var offset = keyboardComponent.keyboardEl.position();
		var total_margin = 2 * offset.left;

		this.el.width(keyboardComponent.layout.width + total_margin);
	};

	return PianoComponent;
});
