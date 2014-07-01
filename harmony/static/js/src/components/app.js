define([
	'lodash',
	'jquery',
	'app/components/component',
	'app/components/ui/piano',
	'app/components/midi/controller',
	'app/models/chord_bank',
	'app/models/key_signature'
], function(
	_,
	$,
	Component,
	PianoComponent,
	MidiControllerComponent,
	ChordBank,
	KeySignature
) {

	var AppComponent = function(settings) {
		this.settings = settings || {};
	};

	AppComponent.prototype = new Component();

	AppComponent.prototype.models = {};
	AppComponent.prototype.initComponent = function() {
		this.models = {};
		this.models.chords = new ChordBank();
		this.models.keySignature = new KeySignature();
		this.initRest();
	};

	AppComponent.prototype.initRest = function() {
		// call all _initXXX methods
		var prefix = "_init", todo = [];
		for(var method in this) {
			if(method.substring(0, prefix.length) === prefix) {
				todo.push(method);
			}
		}
		todo.sort();
		for(var i = 0; i < todo.length; i++) {
			this[todo[i]].call(this);
		}
	};

	_.extend(AppComponent.prototype, {
		_initPianoComponent: function() {
			var c = new PianoComponent({"renderTo": "#piano"});
			c.init();
			c.render();
			this.addComponent(c);
		},
		_initMidiComponent: function() {
			var c = new MidiControllerComponent({
				chords: this.models.chords
			});
			c.init();
			this.addComponent(c);
		}
	});

	return AppComponent;
});
