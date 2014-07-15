define([
	'lodash',
	'jquery',
	'app/components/component',
	'app/components/app',
	'app/components/input/shortcuts',
	'app/components/midi/controller',
	'app/components/ui/piano',
	'app/components/ui/tab_controls',
	'app/components/ui/theme',
	'app/components/ui/transcript',
	'app/models/chord_bank',
	'app/models/key_signature',
	'app/models/midi_device'
], function(
	_,
	$,
	Component,
	AppComponent,
	KeyboardShortcutsComponent,
	MidiControllerComponent,
	PianoComponent,
	TabControlsComponent,
	ThemeComponent,
	TranscriptComponent,
	ChordBank,
	KeySignature,
	MidiDevice
) {

	/**
	 * AppExerciseComponent class.
	 *
	 * Creates the sandbox environment for playing and experimenting
	 * with chords and chord sequences. This is the basic mode of the
	 * application for students to just play around and try things.
	 *
	 * @constructor
	 */
	var AppExerciseComponent = function(settings) {
		AppComponent.call(this, settings);
	};

	AppExerciseComponent.prototype = new AppComponent();

	/**
	 * Returns the models used by the app.
	 */
	AppExerciseComponent.prototype.getModels = function() {
		var models = {};
		models.chords = new ChordBank();
		models.keySignature = new KeySignature();
		models.midiDevice = new MidiDevice();
		return models;
	};

	/**
	 * Returns an array of functions that will create and initialize
	 * each sub-component of the application.
	 *
	 * @return {array} of functions
	 */
	AppExerciseComponent.prototype.getComponentMethods = function() {
		var methods = [
			function() {
				var c = new PianoComponent();
				c.init(this);
				c.renderTo("#piano");
				this.addComponent(c);
			},
			function() {
				var c = new MidiControllerComponent({
					chords: this.models.chords,
					midiDevice: this.models.midiDevice
				});
				c.init(this);
				this.addComponent(c);
			},
			function() {
				var c = new KeyboardShortcutsComponent({
					keySignature: this.models.keySignature
				});
				c.init(this);
				this.addComponent(c);
			},
			function() {
				var c = new TabControlsComponent({
					keySignature: this.models.keySignature,
					midiDevice: this.models.midiDevice
				});
				c.init(this);
				this.addComponent(c);
			},
			function() {
				var c = new TranscriptComponent({
					chords: this.models.chords,
					keySignature: this.models.keySignature
				});
				c.init(this);
				c.renderTo("#staff-area");
				this.addComponent(c);
			},
			function() {
				var c = new ThemeComponent({
					targetEl: "#container"
				});
				c.init(this);
				c.renderTo("#theme-select");
				this.addComponent(c);
			}
		];
		return methods;
	};

	/**
	 * Initializes the application.
	 * Intended to be called $(document).ready().
	 * 
	 * @return undefined
	 */
	AppExerciseComponent.ready = function() {
		app = new AppExerciseComponent();
		app.init();
		app.log("App ready");
	};

	return AppExerciseComponent;
});
