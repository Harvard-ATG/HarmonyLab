define([
	'lodash', 
	'jazzmidibridge',
	'app/components/component'
], function(
	_, 
	JMB,
	Component
) {

	/**
	 * Defines the default instrument (Acoustic Grand Piano).
	 * @type {number}
	 * @const
	 */
	var DEFAULT_INSTRUMENT = 0;
	/**
	 * Defines the default note velocity used to send NOTE ON messages. 
	 * @type {number}
	 * @const
	 */
	var DEFAULT_NOTE_VELOCITY = 127;
	/**
	 * Defines the note velocity used to reduce the volume of NOTE ON messages.
	 * @type {number}
	 * @const
	 */
	var SOFT_NOTE_VELOCITY = 84;
	/**
	 * Maps MIDI control numbers to names and vice versa for lookup
	 * @type {object}
	 * @const
	 */
	var MIDI_CONTROL_MAP = {
		'pedal': {
			'64': 'sustain',
			'66': 'sostenuto', 
			'67': 'soft',
			'sustain': 64,
			'sostenuto': 66,
			'soft': 67
		}
	};

	/**
	 * MidiControllerComponent
	 *
	 * This component controls the interactions between the application and
	 * the MIDI device driver (i.e. browser plugin). It listens for MIDI-related
	 * messages from the application and translates them into instructions for
	 * the MIDI driver and vice versa. 
	 *
	 * Note that the Jazz Midi Bridge (JMB) is a high-level library used to
	 * interface with the Jazz Midi Plugin, which in turn handles low-level
	 * MIDI input/output.
	 *
	 * @constructor
	 * @param {object} settings
	 * @param {object} settings.chords Chords object (required).
	 * @mixes MicroEvent
	 * @fires devices
	 */
	var MidiControllerComponent = function(settings) {
		/**
		 * Configuration.
		 * @type {object}
		 * @protected
		 */
		this.settings = settings || {};
		/**
		 * The midi channel used to transmit messages.
		 * @type {number}
		 * @protected
		 */
		this.midiChannel = 0;
		/**
		 * The MIDI access object used to send/receive MIDI messages (see Jazz
		 * Midi Bridge - JMB)
		 * @type {object}
		 * @protected
		 */
		this.midiAccess = null;
		/**
		 * The note velocity used to send NOTE ON midi messages. 
		 * @type {number}
		 * @protected
		 */
		this.noteVelocity = DEFAULT_NOTE_VELOCITY;
		/**
		 * Holds the list of input/output devices that are detected by the MIDI
		 * Jazz Plugin.
		 * @type {object}
		 * @protected
		 */
		this.midiDevice = {
			inputs: [],
			outputs: [],
			selectedInput: null,
			selectedOutput: null,
			defaults: { 
				inputIndex: 0,
				outputIndex: 0
			}
		};
		/**
		 * Holds a reference to the Chords object. 
		 * @type {object}
		 * @protected
		 */
		this.chords = null;

		this.init();
	};

	MidiControllerComponent.prototype = new Component();

	_.extend(MidiControllerComponent.prototype, {
		/**
		 * Initializes the MidiControllerComponent.
		 *
		 * @return undefined
		 */
		initComponent: function() {
			if(!this.settings.hasOwnProperty('chords')) {
				throw new Error("missing settings.chords");
			}

			this.chords = this.settings.chords;

			_.bindAll(this, [
				'onMidiMessage',
				'onNoteChange',
				'onClearNotes',
				'onBankNotes',
				'onPedalChange',
				'onInstrumentChange',
				'onTransposeChange'
			]);

			this.onJMBInit = this.execAfter(this.onJMBInit, this.initListeners);
			this.onJMBError = this.execAfter(this.onJMBError, this.initListeners);

			JMB.init(this.onJMBInit, this.onJMBError);
		},
		/**
		 * Called when the Jazz Midi Bridge (JMB) has been initialized
		 * and is ready for access.
		 *
		 * @param {object} MIDIAccess
		 * @return undefined
		 */
		onJMBInit: function(MIDIAccess) {
			if(MIDIAccess) {
				this.midiAccess = MIDIAccess;
				this.detectDevices();
				this.selectDefaultDevices();
			}
		},
		/**
		 * Called when the Jazz Midi Bridge (JMB) encounters an error while it
		 * is initializing itself.
		 *
		 * @return undefined
		 */
		onJMBError: function() {
			var error = 'Jazz MIDI Plugin Required';
			var htmlError = '<p>Your browser is missing the <a href="http://jazz-soft.net/download">Jazz MIDI plugin</a>. ' +
				'This browser plugin is required to produce sound with the on-screen keyboard or to ' + 
				'connect and use your own MIDI keyboard.</p>' +
				'<p>Please download and install the Jazz MIDI plugin here: <br/>' + 
				'<a href="http://jazz-soft.net/download">http://jazz-soft.net/</a>.</p>';

			this.broadcast("error:jazzmidiplugin", {error:error, htmlError:htmlError});
		},
		/**
		 * Detects the devices that are available.
		 *
		 * @return undefined
		 * @fires devices
		 */
		detectDevices: function() {
			if(this.midiAccess) {
				this.midiDevice.outputs = this.midiAccess.enumerateOutputs() || [];
				this.midiDevice.inputs = this.midiAccess.enumerateInputs() || [];
				this.trigger('devices', this.midiDevice.inputs, this.midiDevice.outputs, this.midiDevice.defaults);
			}
		},
		/**
		 * Scans for changes to the MIDI devices.
		 *
		 * @return undefined
		 */
		scanDevices: function() {
			JMB.rescan();
		},
		/**
		 * Selects default MIDI devices.
		 *
		 * @return undefined
		 */
		selectDefaultDevices: function() {
			var outputs = this.midiDevice.outputs;
			var inputs = this.midiDevice.inputs;
			if(outputs && outputs.length > 0) {
				this.midiDevice.selectedOutput = outputs[this.midiDevice.defaults.outputIndex];
			}
			if(inputs && inputs.length > 0) {
				this.midiDevice.selectedInput = inputs[this.midiDevice.defaults.inputIndex];
			}
		},
		/**
		 * Selects a MIDI device for input and output.
		 *
		 * @param {string} type input|output
		 * @param {number} index of the device in the list of devices
		 * @return {boolean} True if a device was selected, false otherwise.
		 */
		selectDevice: function(type, index) {
			switch(type) {
				case 'input': 
					if(this.midiDevice.inputs.length > 0) {
						this.midiDevice.selectedInput = this.midiDevice.inputs[index];
						return true;
					}
					break;
				case 'output':
					if(this.midiDevice.outputs.length > 0) {
						this.midiDevice.selectedOutput = this.midiDevice.outputs[index];
						return true;
					}
					break;
			}
			return false;
		},
		/**
		 * Initializes listeners.
		 *
		 * @return undefined
		 */
		initListeners: function() {
			this.subscribe('note', this.onNoteChange);
			this.subscribe('clearnotes', this.onClearNotes);
			this.subscribe('banknotes', this.onBankNotes);
			this.subscribe('pedal', this.onPedalChange);
			this.subscribe('instrument', this.onInstrumentChange);
			this.subscribe('transpose', this.onTransposeChange);

			if(this.midiDevice.selectedInput) {
				this.midiDevice.selectedInput.addEventListener('midimessage', this.onMidiMessage);
			}
		},
		/**
		 * Handles a MIDI message received from the MIDI device.
		 *
		 * @param {object} msg
		 * @return undefined
		 */
		onMidiMessage: function(msg) {
			var command = msg.command;

			// SPECIAL CASE: "note on" with 0 velocity implies "note off"
			if(command === JMB.NOTE_ON && !msg.data2) {
				command = JMB.NOTE_OFF;
			}

			switch(command) {
				case JMB.NOTE_ON:
					this.triggerNoteOn(msg.data1, msg.data2);
					break;
				case JMB.NOTE_OFF:
					this.triggerNoteOff(msg.data1, msg.data2);
					break;
				case JMB.CONTROL_CHANGE:
					if(this.isPedalControlChange(msg.data1)) {
						this.triggerPedalChange(msg.data1, msg.data2);
					}
					break;
				default:
					console.log("midi message not handled: ", msg);
			}
		},
		/**
		 * Returns true if the control message maps to a supported pedal.
		 *
		 * @param {number} controlNum MIDI control change number
		 * @return {boolean}
		 */
		isPedalControlChange: function(controlNum) {
			return MIDI_CONTROL_MAP.pedal.hasOwnProperty(controlNum);
		},
		/**
		 * Broadcasts a pedal change event to the application.
		 *
		 * @param {number} controlNum
		 * @param {number} controlVal
		 * @return undefined
		 */
		triggerPedalChange: function(controlNum, controlVal) {
			var pedal_name = MIDI_CONTROL_MAP.pedal[controlNum];
			var pedal_state = 'off';

			// NOTE: the Yamaha FC5 sustain pedal sends value 0 when 
			// the pedal is depressed and 127 when it is released.
			// This is the pedal students are using in class, so we're 
			// going to treat control values 0-63=ON and 64-127=OFF.
		
			if(controlVal >= 0 && controlVal <= 63) {
				pedal_state = 'on';
			} else if(controlVal > 63) {
				pedal_state = 'off';
			} 

			this.broadcast('pedal', pedal_name, pedal_state);
		},
		/**
		 * Broadcasts a note "on" event to the application.
		 *
		 * @param {number} noteNum
		 * @param {number} noteVelocity
		 * @return undefined
		 */
		triggerNoteOn: function(noteNum, noteVelocity) {
			if(this.noteVelocity !== null) {
				noteVelocity = this.noteVelocity;
			}
			this.broadcast('note', 'on', noteNum, noteVelocity);
		},
		/**
		 * Broadcasts a note "off" event to the application.
		 *
		 * @param {number} noteNum
		 * @param {number} noteVelocity
		 * @return undefined
		 */
		triggerNoteOff: function(noteNum, noteVelocity) {
			if(this.noteVelocity !== null) {
				noteVelocity = this.noteVelocity;
			}
			this.broadcast('note', 'off', noteNum, noteVelocity);
		},
		/**
		 * Handles a note change event and sends a NOTE ON/OFF message to the
		 * MIDI device.
		 *
		 * @param {string} noteState on|off
		 * @param {number} noteNumber
		 * @return undefined
		 */
		onNoteChange: function(noteState, noteNumber) {
			var command = (noteState === 'on' ? JMB.NOTE_ON : JMB.NOTE_OFF);
			this.toggleNote(noteState, noteNumber);
			this.sendMIDIMessage(command, noteNumber, this.noteVelocity);
		},
		/**
		 * Clears all notes that are sounding.
		 *
		 * @return undefined
		 */
		onClearNotes: function() {
			this.sendAllNotesOff();

			if(this.chords.anySustained()) {
				this.sendMIDIPedalMessage('sustain', 'off');
				this.sendMIDIPedalMessage('sustain', 'on');
			}

			this.chords.clear();
		},
		/**
		 * Banks the current chord notes.
		 *
		 * @return undefined
		 */
		onBankNotes: function() {
			this.chords.bank();
		},
		/**
		 * Handles a pedal change event. 
		 *
		 * @param {string} pedal sustain|sostenuto|soft
		 * @param {string} state on|off
		 * @return undefined
		 */
		onPedalChange: function(pedal, state) {
			var chord = this.chords.current();
			switch(pedal) {
				case 'soft':
					this.noteVelocity = (state === 'off' ? DEFAULT_NOTE_VELOCITY : SOFT_NOTE_VELOCITY);
					break;
				case 'sustain':
					if(state==='on') {
						chord.sustainNotes();
						this.chords.bank();
					} else {
						chord.releaseSustain();
						chord.syncSustainedNotes();
					}
					this.sendMIDIPedalMessage(pedal, state);
					break;
				default:
					break;
			}
		},
		/**
		 * Handles an instrument change event.
		 *
		 * @param {number} instrumentNum
		 * @return undefined
		 */
		onInstrumentChange: function(instrumentNum) {
			var command = JMB.PROGRAM_CHANGE;
			instrumentNum = instrumentNum < 0 ? DEFAULT_INSTRUMENT : instrumentNum;

			this.sendMIDIMessage(command, instrumentNum, 0, this.midiChannel);
		},
		/**
		 * Handles a transpose event.
		 *
		 * @param {number} transpose
		 * @return undefined
		 */
		onTransposeChange: function(transpose) {
			var chord = this.chords.current();
			chord.setTranspose(transpose);
		},
		/**
		 * Toggles a note in the chord model.
		 *
		 * @param {string} noteState on|off
		 * @param {number} noteNumber
		 * @return undefined
		 */
		toggleNote: function(noteState, noteNumber) {
			var toggle = (noteState === 'on' ? 'noteOn' : 'noteOff');
			var chord = this.chords.current();
			chord[toggle](noteNumber);
		},
		/**
		 * Sends MIDI messages to turn off all notes. This should stop all notes
		 * from sounding.
		 *
		 * @return undefined
		 */
		sendAllNotesOff: function() {
			var notes = this.chords.getAllNotes();
			_.each(notes, function(noteNumber) {
				this.sendMIDIMessage(JMB.NOTE_OFF, noteNumber, this.noteVelocity);
			}, this);
		},
		/**
		 * Outputs a MIDI message via the Jazz MIDI bridge.
		 *
		 * @return undefined
		 */
		sendMIDIMessage: function() {
			var output = this.midiDevice.selectedOutput; 
			var midiAccess = this.midiAccess;
			var msg; 
			if(this.midiAccess) {
				msg = midiAccess.createMIDIMessage.apply(midiAccess, arguments);
				if(output) {
					output.sendMIDIMessage(msg);
				} 
			}
		},
		/**
		 * Output a MIDI message to turn a pedal on/off.
		 *
		 * @param {string} pedal sustain|sostenuto|soft
		 * @param {string} state on|off
		 * @return undefined
		 */
		sendMIDIPedalMessage: function(pedal, state) {
			var command = JMB.CONTROL_CHANGE;
			var controlNumber = MIDI_CONTROL_MAP.pedal[pedal];
			var controlValue = (state === 'off' ? 0 : 127);
			this.sendMIDIMessage(command, controlNumber, controlValue, this.midiChannel);
		},
		/**
		 * Returns a function that when called will execute the first function
		 * and then the second function, but return the results of the first
		 * function.
		 *
		 * @param {function} firstFn Results of this function will be returned.
		 * @param {function} secondFn Called after the first for the side effect.
		 * @return {mixed}
		 */
		execAfter: function(firstFn, secondFn) {
			var that = this;
			return function() {
				var result = firstFn.apply(that, arguments);
				secondFn.call(that);
				return result;
			};
		}
	});

	return MidiControllerComponent;
});
