define([
	'lodash',
	'jquery',
	'app/components/component',
	'app/components/input/shortcuts',
	'app/components/midi/controller',
	'app/components/ui/piano',
	'app/components/ui/tab_controls',
	'app/models/chord_bank',
	'app/models/key_signature',
	'app/models/midi_device'
], function(
	_,
	$,
	Component,
	KeyboardShortcutsComponent,
	MidiControllerComponent,
	PianoComponent,
	TabControlsComponent,
	ChordBank,
	KeySignature,
	MidiDevice
) {

	var AppComponent = function(settings) {
		this.settings = settings || {};
	};

	AppComponent.prototype = new Component();

	AppComponent.prototype.models = {};
	AppComponent.prototype.initComponent = function() {
		this.models = {};
		this._setupComponents([
			'_setupNavTabControlsComponent',
			'_setupPianoComponent',
			'_setupKeyboardShortcutsComponent',
			'_setupMidiComponent',
		]);
	};

	AppComponent.prototype._setupComponents = function(methods) {
		this._beforeSetup();
		for(var i = 0, len = methods.length; i < len; i++) {
			this[methods[i]].call(this);
		}
		this._afterSetup();
	};

	_.extend(AppComponent.prototype, {
		_beforeSetup: function() {
			this.models.chords = new ChordBank();
			this.models.keySignature = new KeySignature();
			this.models.midiDevice = new MidiDevice();
		},
		_afterSetup: function() {
			this.fadeIn();
		},
		_setupPianoComponent: function() {
			var c = new PianoComponent();
			c.init(this);
			c.renderTo("#piano");
			this.addComponent(c);
		},
		_setupMidiComponent: function() {
			var c = new MidiControllerComponent({
				chords: this.models.chords,
				midiDevice: this.models.midiDevice
			});
			c.init(this);
			this.addComponent(c);
		},
		_setupKeyboardShortcutsComponent: function() {
			var c = new KeyboardShortcutsComponent({
				keySignature: this.models.keySignature
			});
			c.init(this);
			this.addComponent(c);
		},
		_setupNavTabControlsComponent: function() {
			var c = new TabControlsComponent({
				keySignature: this.models.keySignature,
				midiDevice: this.models.midiDevice
			});
			c.init(this);
			this.addComponent(c);
		},
		fadeIn: function() {
			$('.js-fade-in').css('opacity', 1);
			$('.js-fade-out').css('opacity', 0);
		},
		fadeOut: function() {
			$('.js-fade-in').css('opacity', 0);
			$('.js-fade-out').css('opacity', 1);
		}
	});

	return AppComponent;
});
