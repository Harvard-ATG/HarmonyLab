define([
	'lodash', 
	'microevent', 
	'jazzmidibridge', 
	'app/eventbus', 
], function(_, MicroEvent, JMB, eventBus, midiInstruments) {

	var DEFAULT_NOTE_VELOCITY = 100;

	/**
	 * The midi controller is responsible for coordinating midi messages 
	 * from both external keyboard devices and onscreen devices as well
	 * as handling midi control changes.
	 *
	 * It interfaces with external devices using the Jazz Midi Bridge
	 * (JMB) and uses the event bus to broadcast interesting events
	 * to other application components.
	 */
	var MidiController = function(config) {
		this.config = config || {};
		this.init();
	};

	_.extend(MidiController.prototype, {
		eventBus: eventBus,
		channel: 0,
		program: 0,
		outputDevices: [],
		inputDevices: [],
		output: null,
		input: null,
		midiAccess: null, // api via jazzmidibridge
		defaults: { 
			outputIndex: 0, 
			inputIndex: 0,
			instrumentNum: 0
		},

		// Initializes the MIDI router to send and receive MIDI messages.
		init: function() {
			if(!this.config.hasOwnProperty('midiNotes')) {
				throw new Error("missing config property");
			}

			this.midiNotes = this.config.midiNotes;

			_.bindAll(this, [
				'onJMBInit',
				'onMidiMessage',
				'onNoteChange',
				'onPedalChange',
				'onChangeInstrument'
			]);

			JMB.init(this.onJMBInit);
		},

		// Initializes the Jazz Midi Bridge (JMB) and related event handlers.
		onJMBInit: function(MIDIAccess) {
			this.midiAccess = MIDIAccess;
			this.detectDevices();
			this.selectDefaultDevices();
			this.initListeners();
		},

		// Detects midi devices.
		detectDevices: function() {
			this.outputDevices = this.midiAccess.enumerateOutputs() || [];
			this.inputDevices = this.midiAccess.enumerateInputs() || [];
			this.trigger('devices', this.inputDevices, this.outputDevices, this.defaults);
		},

		// Scans for changes to midi devices.
		scanDevices: function() {
			JMB.rescan();
		},

		// Selects a default midi input and output device (if any). 
		selectDefaultDevices: function() {
			var outputs = this.outputDevices;
			var inputs = this.inputDevices;
			if(outputs && outputs.length > 0) {
				this.output = outputs[this.defaults.outputIndex];
			}
			if(inputs && inputs.length > 0) {
				this.input = inputs[this.defaults.inputIndex];
			}
		},

		// Selects a device for input/output.
		selectDevice: function(type, index) {
			switch(type) {
				case 'input': 
					if(this.inputDevices.length > 0) {
						this.input = this.inputDevices[index];
					}
					break;
				case 'output':
					if(this.outputDevices.length > 0) {
						this.output = this.outputDevices[index];
					}
					break;
			}
		},

		// Initializes listeners.
		initListeners: function() {

			this.eventBus.bind('note', this.onNoteChange);
			this.eventBus.bind('pedal', this.onPedalChange);
			this.eventBus.bind('instrument', this.onChangeInstrument);

			if(this.input) {
				this.input.addEventListener('midimessage', this.onMidiMessage);
			}
		},

		// Toggles a note state.
		toggleNote: function(noteState, noteNumber) {
			return this.midiNotes[noteState==='on'?'noteOn':'noteOff'](noteNumber);
		},

		// Handles a midi message. 
		onMidiMessage: function(msg) {
			var command = msg.command;

			// SPECIAL CASE: "note on" with 0 velocity implies "note off"
			if(command === JMB.NOTE_ON && !msg.data2) {
				command = JMB.NOTE_OFF;
			}

			switch(command) {
				case JMB.NOTE_ON:
					this.eventBus.trigger('note', 'on', msg.data1, DEFAULT_NOTE_VELOCITY || msg.data2);
					break;
				case JMB.NOTE_OFF:
					this.eventBus.trigger('note', 'off', msg.data1, DEFAULT_NOTE_VELOCITY || msg.data2);
					break;
				case JMB.CONTROL_CHANGE:
					break;
				default:
					console.log("midi message not handled: ", msg);
			}
		},

		// Handles note output (not from an external device). 
		onNoteChange: function(noteState, noteNumber, noteVelocity) {
			noteVelocity = DEFAULT_NOTE_VELOCITY || noteVelocity; 
			var changed = this.toggleNote(noteState, noteNumber);
			if(changed) {
				var midiCommand = (noteState === 'on' ? JMB.NOTE_ON : JMB.NOTE_OFF);
				var midiMessage = this.midiAccess.createMIDIMessage(midiCommand, noteNumber, noteVelocity);
				this.output.sendMIDIMessage(midiMessage);
			}
		},

		// Handles sustain, sostenuto, soft pedal events.
		onPedalChange: function(pedal, state) {
			var controlNumberOf = { 'sustain': 64, 'sostenuto': 66, 'soft': 67 },
				controlValueOf = { 'on': 127, 'off': 0 },
				command = JMB.CONTROL_CHANGE,
				controlNumber = controlNumberOf[pedal], 
				controlValue = controlValueOf[state],
				msg = this.midiAccess.createMIDIMessage(command,controlNumber,controlValue,this.channel);

				if(this.output) {
					this.output.sendMIDIMessage(msg);
				}
		},

		// Handles change of instrument.
		onChangeInstrument: function(instrumentNum) {
			var command = JMB.PROGRAM_CHANGE;
			if(instrumentNum < 0) {
				instrumentNum = this.defaults.instrumentNum;
			}
			var msg = this.midiAccess.createMIDIMessage(command,instrumentNum,0,this.channel);

			if(this.output) {
				this.output.sendMIDIMessage(msg);
			}
		}
	});

	MicroEvent.mixin(MidiController); // make object observable

	return MidiController;
});
