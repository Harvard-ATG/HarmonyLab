/* global define:false */
define([
	'lodash', 
	'microevent', 
	'jazzmidibridge', 
	'app/model/event_bus',
	'app/view/modal'
], function(_, MicroEvent, JMB, eventBus, Modal) {
	"use strict";

	/**
	 * The midi source is responsible for handling midi messages 
	 * from both external keyboard devices and onscreen devices as well
	 * as handling midi control changes.
	 *
	 * It interfaces with external devices using the Jazz Midi Bridge
	 * (JMB) and uses the event bus to broadcast interesting events
	 * to other application components.
	 */
	var MidiSource = function(config) {
		this.config = config || {};
		this.init();
	};

	_.extend(MidiSource.prototype, {
		eventBus: eventBus,

		// jazzmidibridge api for midi input/output
		midiAccess: null, 

		channel: 0, // default midi channel
		defaultInstrumentNum: 0, // default instrument

		// apply uniform note velocity (volume is too low otherwise)
		noteVelocity: 127, // current value: 0-127
		defaultNoteVelocity: 127,
		reducedNoteVelocity: 84,

		outputDevices: [], // list of available outputs
		inputDevices: [], // list of available inputs
		output: null, // selected output device
		input: null, // selected input device
		defaultDevices: { outputIndex: 0, inputIndex: 0 },

		// mappings for MIDI control changes
		midiControlMap: {
			'pedal': {
				'64': 'sustain',
				'66': 'sostenuto', 
				'67': 'soft',
				'sustain': 64,
				'sostenuto': 66,
				'soft': 67
			}
		},

		// Initializes the MIDI router to send and receive MIDI messages.
		init: function() {
			if(!this.config.hasOwnProperty('chords')) {
				throw new Error("missing config property");
			}

			this.chords = this.config.chords;

			_.bindAll(this, [
				'onMidiMessage',
				'onNoteChange',
				'onPedalChange',
				'onChangeInstrument'
			]);

			this.onJMBInit = this.execAfter(this.onJMBInit, this.initListeners);
			this.onJMBError = this.execAfter(this.onJMBError, this.initListeners);

			JMB.init(this.onJMBInit, this.onJMBError);
		},

		// Initializes the Jazz Midi Bridge (JMB) and related event handlers.
		onJMBInit: function(MIDIAccess) {
			if(MIDIAccess) {
				this.midiAccess = MIDIAccess;
				this.detectDevices();
				this.selectDefaultDevices();
			}
		},

		// Handles error on Jazz Midi Bridge error
		onJMBError: function() {
			var title = 'Jazz MIDI Plugin Required';
			var msg = '<p>Your browser is missing the <a href="http://jazz-soft.net/download">Jazz MIDI plugin</a>. '
				+ 'This browser plugin is required to produce sound with the on-screen keyboard or to '
				+ 'connect and use your own MIDI keyboard.</p>'
				+ '<p>Please download and install the Jazz MIDI plugin here: <br/>'
				+ '<a href="http://jazz-soft.net/download">http://jazz-soft.net/</a>.</p>';

			Modal.msg(title, msg);
		},

		// Detects midi devices.
		detectDevices: function() {
			if(this.midiAccess) {
				this.outputDevices = this.midiAccess.enumerateOutputs() || [];
				this.inputDevices = this.midiAccess.enumerateInputs() || [];
				this.trigger('devices', this.inputDevices, this.outputDevices, this.defaultDevices);
			}
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
				this.output = outputs[this.defaultDevices.outputIndex];
			}
			if(inputs && inputs.length > 0) {
				this.input = inputs[this.defaultDevices.inputIndex];
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
			return this.chords.current()[noteState==='on'?'noteOn':'noteOff'](noteNumber);
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
					this.eventBus.trigger('note', 'on', msg.data1, this.noteVelocity || msg.data2);
					break;
				case JMB.NOTE_OFF:
					this.eventBus.trigger('note', 'off', msg.data1, this.noteVelocity || msg.data2);
					break;
				case JMB.CONTROL_CHANGE:
					if(this.midiControlMap.pedal.hasOwnProperty(msg.data1)) {
						this.eventBus.trigger('pedal', this.midiControlMap.pedal[msg.data1], msg.data2 === 0 ? 'off' : 'on');
					}
					break;
				default:
					console.log("midi message not handled: ", msg);
			}
		},

		// Handles note output (not from an external device). 
		onNoteChange: function(noteState, noteNumber) {
			this.toggleNote(noteState, noteNumber);

			var command = (noteState === 'on' ? JMB.NOTE_ON : JMB.NOTE_OFF);
			this.sendMIDIMessage(command, noteNumber, this.noteVelocity);
		},

		// Handles sustain, sostenuto, soft pedal events.
		onPedalChange: function(pedal, state) {
			var command = JMB.CONTROL_CHANGE;
			var controlNumber = this.midiControlMap.pedal[pedal];
			var controlValue = (state === 'off' ? 0 : 127);

			if(pedal === 'soft') {
				this.noteVelocity = (state === 'off' ? this.defaultNoteVelocity : this.reducedNoteVelocity);
			} else if(pedal === 'sustain') {
				if(state === 'on') {
					this.chords.current().sustainNotes();
				} else if(state === 'off') {
					this.chords.bank();
				} 
			}

			this.sendMIDIMessage(command, controlNumber, controlValue, this.channel);
		},

		// Handles change of instrument.
		onChangeInstrument: function(instrumentNum) {
			var command = JMB.PROGRAM_CHANGE;
			instrumentNum = instrumentNum < 0 ? this.defaultInstrumentNum : instrumentNum;

			this.sendMIDIMessage(command, instrumentNum, 0, this.channel);
		},

		// Outputs a MIDI message via the Jazz MIDI bridge
		sendMIDIMessage: function() {
			var msg, output = this.output, midiAccess = this.midiAccess;
			if(this.midiAccess) {
				msg = midiAccess.createMIDIMessage.apply(midiAccess, arguments);
				if(output) {
					output.sendMIDIMessage(msg);
				} 
			}
		},

		// Execute the second fn after the first one, returning the result of the first
		execAfter: function(firstFn, secondFn) {
			var that = this;
			return function() {
				var result = firstFn.apply(that, arguments);
				secondFn.call(that);
				return result;
			};
		}
	});

	MicroEvent.mixin(MidiSource); // make object observable

	return MidiSource;
});
