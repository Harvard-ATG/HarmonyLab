define([
	'module',
	'lodash',
	'jquery',
	'app/components/component',
	'app/components/app',
	'app/components/piano',
	'app/components/music',
	'app/components/music/exercise_sheet',
	'app/components/midi',
	'app/components/notifications',
	'app/components/input/shortcuts',
	'app/components/ui/main_menu',
	'app/components/ui/music_controls',
	'app/models/key_signature',
	'app/models/midi_device',
	'app/models/exercise_chord_bank',
	'app/models/exercise_definition',
	'app/models/exercise_grader',
	'app/models/exercise_context'
], function(
	module,
	_,
	$,
	Component,
	AppComponent,
	PianoComponent,
	MusicComponent,
	ExerciseSheetComponent,
	MidiComponent,
	NotificationsComponent,
	KeyboardShortcutsComponent,
	MainMenuComponent,
	MusicControlsComponent,
	KeySignature,
	MidiDevice,
	ExerciseChordBank,
	ExerciseDefinition,
	ExerciseGrader,
	ExerciseContext
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
		models.inputChords = new ExerciseChordBank();
		models.midiDevice = new MidiDevice();
		models.exerciseDefinition = new ExerciseDefinition({
			definition: this.getExerciseDefinition()
		});
		models.exerciseGrader = new ExerciseGrader();
		models.exerciseContext = new ExerciseContext({
			inputChords: models.inputChords,
			grader: models.exerciseGrader,
			definition: models.exerciseDefinition
		});
		models.keySignature = new KeySignature(models.exerciseDefinition.getKey(), models.exerciseDefinition.getKeySignature());
		return models;
	};

	/**
	 * Returns the exercise definition.
	 */
	AppExerciseComponent.prototype.getExerciseDefinition = function() {
		var exercise_config = module.config();
		if(!exercise_config) { 
			throw new Error("getExerciseDefinition(): missing exercise configuration data"); 
		}
		return exercise_config; //$.extend(true, {}, exercise_config); // Return deep copy of the config
	};

	/**
	 * Returns an array of functions that will create and initialize
	 * each sub-component of the application.
	 *
	 * @return {array} of functions
	 */
	AppExerciseComponent.prototype.getComponentMethods = function() {
		var methods = [
			function () {
				var c = new NotificationsComponent();
				c.init(this);
				c.renderTo("#notifications", "#notificationAlerts");
				this.addComponent(c);
			},
			function() {
				var c = new PianoComponent({
					toolbarConfig: {metronome: false}
				});
				c.init(this);
				c.renderTo("#piano");
				this.addComponent(c);
			},
			function() {
				var c = new MidiComponent({
					chords: this.models.inputChords,
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
				var c = new MainMenuComponent({
					headerEl: "#header",
					menuEl: "#mainmenu",
					menuSelector: ".js-btn-menu"
				});
				c.init(this);
				this.addComponent(c);
			},
			function() {
				var c = new MusicControlsComponent({
					headerEl: "#header",
					containerEl: "#mainmenu",
					keySignature: this.models.keySignature,
					midiDevice: this.models.midiDevice,
					exerciseContext: this.models.exerciseContext
				});
				c.init(this);
				this.addComponent(c);
			},
			function() {
				var definition = this.models.exerciseContext.getDefinition();
				var c = new MusicComponent({
					el: $("#staff-area"),
					sheet: new ExerciseSheetComponent({
						exerciseContext: this.models.exerciseContext,
						keySignature: this.models.keySignature
					}),
					analysisSettings: definition.getAnalysisSettings(),
					highlightSettings: definition.getHighlightSettings()
				});
				c.init(this);
				c.render();
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
