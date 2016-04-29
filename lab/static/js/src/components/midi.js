define([
	'lodash', 
	'jazzmidibridge',
	'app/config',
	'app/components/events',
	'app/components/component'
], function(
	_, 
	JMB,
	Config,
	EVENTS,
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
	 * Defines the title of the jazz midi error.
	 * @type {string} 
	 * @const
	 */
	var JAZZ_MIDI_ERROR_TITLE = Config.get("errorText.jazzMidiPluginError.title");
	/**
	 * Defines the content of the jazz midi error.
	 * @type {string} 
	 * @const
	 */
	var JAZZ_MIDI_ERROR_CONTENT = Config.get("errorText.jazzMidiPluginError.description");


	/**
	 * MidiComponent
	 *
	 * This component coordinates the interactions between the application and
	 * the MIDI device driver (i.e. browser plugin). It listens for MIDI-related
	 * messages from the application and translates them into instructions for
	 * the MIDI driver and vice versa. 
	 *
	 * Note that the Jazz Midi Bridge (JMB) is a library used to interface with 
	 * the Jazz Midi Plugin, which in turn handles low-level MIDI input/output.
	 *
	 * @constructor
	 * @param {object} settings
	 * @param {object} settings.chords Chords object (required).
	 * @param {object} settings.midiDevice MidiDevice object (required).
	 */
	var MidiComponent = function(settings) {
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
		 * The MidiDevice object that knows which Jazz MiDI input/output devices
		 * are available and how to use them.
		 * @type {object}
		 * @protected
		 */
		this.midiDevice = null;
		/**
		 * Holds a reference to the Chords object. 
		 * @type {object}
		 * @protected
		 */
		this.chords = null;

		_.bindAll(this, [
			'onMidiMessage',
			'onNoteChange',
			'onClearNotes',
			'onBankNotes',
			'onPedalChange',
			'onInstrumentChange',
			'onTransposeChange',
			'onJMBInit',
			'onJMBError'
		]);
	};

	MidiComponent.prototype = new Component();

	_.extend(MidiComponent.prototype, {
		/**
		 * Initializes the MidiComponent.
		 *
		 * @return undefined
		 */
		initComponent: function() {
			if(!("chords" in this.settings)) {
				throw new Error("missing settings.chords");
			} 
			if(!("midiDevice" in this.settings)) {
				throw new Error("missing settings.midiDevice");
			} 

			this.chords = this.settings.chords;
			this.midiDevice = this.settings.midiDevice;

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
			this.setMIDIAccess(MIDIAccess);
			this.midiDevice.setUpdater(function() {
				var inputs = MIDIAccess.enumerateInputs();
				var outputs = MIDIAccess.enumerateOutputs();
				this.clear();
				this.setSources(inputs, outputs);
				this.selectDefaults();
			});
			this.updateDevices();
			this.initListeners();
		},
		/**
		 * Called when the Jazz Midi Bridge (JMB) encounters an error while it
		 * is initializing itself.
		 *
		 * @return undefined
		 */
		onJMBError: function() {
			this.broadcast(EVENTS.BROADCAST.NOTIFICATION, {
				type: "error",
				title: JAZZ_MIDI_ERROR_TITLE,
				description: JAZZ_MIDI_ERROR_CONTENT
			});
			this.initListeners();
		},
		/**
		 * Initializes listeners.
		 *
		 * @return undefined
		 */
		initListeners: function() {
			this.subscribe(EVENTS.BROADCAST.NOTE, this.onNoteChange);
			this.subscribe(EVENTS.BROADCAST.CLEAR_NOTES, this.onClearNotes);
			this.subscribe(EVENTS.BROADCAST.BANK_NOTES, this.onBankNotes);
			this.subscribe(EVENTS.BROADCAST.PEDAL, this.onPedalChange);
			this.subscribe(EVENTS.BROADCAST.INSTRUMENT, this.onInstrumentChange);
			this.subscribe(EVENTS.BROADCAST.TRANSPOSE, this.onTransposeChange);
			this.midiDevice.bind("midimessage", this.onMidiMessage);
		},
		/**
		 * Sets the Jazz MIDI Access bridge.
		 *
		 * @param {object} MIDIAccess
		 * @return undefined
		 */
		setMIDIAccess: function(MIDIAccess) {
			if(MIDIAccess) {
				this.midiAccess = MIDIAccess;
			}
		},
		/**
		 * Detects the devices that are available.
		 *
		 * @return undefined
		 * @fires devices
		 */
		updateDevices: function() {
			this.midiDevice.update();
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
			var pedal_change = false;

			/* Make true for Yamaha FC5 sustain */
			/* Make false for Yamaha DGX-620 */
			var interpret_low_as_on = false;

			// Set control values 0-63=ON and 64-127=OFF or vice versa.
		
			if(interpret_low_as_on == true) {
				if(controlVal >= 0 && controlVal <= 63
					/* and if pedal is currently off */
				) {
					pedal_state = 'on';
					pedal_change = true;
				} else if(controlVal > 63
					/* and if pedal is currently on */
				) {
					pedal_state = 'off';
					pedal_change = true;
				}
			} else {
				if(controlVal >= 0 && controlVal <= 63
					/* and if pedal is currently on */
				) {
					pedal_state = 'off';
					pedal_change = true;
				} else if(controlVal > 63
					/* and if pedal is currently off */
				) {
					pedal_state = 'on';
					pedal_change = true;
				}
			}

			if(pedal_change == true) {
				this.broadcast(EVENTS.BROADCAST.PEDAL, pedal_name, pedal_state);
			}
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
			this.broadcast(EVENTS.BROADCAST.NOTE, 'on', noteNum, noteVelocity);
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
			this.broadcast(EVENTS.BROADCAST.NOTE, 'off', noteNum, noteVelocity);
		},
		/**
		 * Toggles a note in the chord model.
		 *
		 * @param {string} noteState on|off
		 * @param {number} noteNumber
		 * @param {extra} extra.overrideSustain true|false overrides sustain
		 * @return undefined
		 */
		toggleNote: function(noteState, noteNumber, extra) {
			var toggle = (noteState === 'on' ? 'noteOn' : 'noteOff');
			var chord = this.chords.current();
			var noteObj = {notes: [noteNumber]};
			if(extra && typeof extra === 'object') {
				_.assign(noteObj, extra);
			}
			chord[toggle](noteObj);
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
		 * Handles a note change event and sends a NOTE ON/OFF message to the
		 * MIDI device.
		 *
		 * @param {string} noteState on|off
		 * @param {number} noteNumber
		 * @param {object} extra
		 * @return undefined
		 */
		onNoteChange: function(noteState, noteNumber, extra) {
			var command = (noteState === 'on' ? JMB.NOTE_ON : JMB.NOTE_OFF);
			this.toggleNote(noteState, noteNumber, extra);
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
		 * Sends MIDI messages to turn off all notes. This should stop all notes
		 * from sounding.
		 *
		 * @return undefined
		 */
		sendAllNotesOff: function() {
			var notes = this.chords.getAllNotes();
			var noteVelocity = this.noteVelocity;
			for(var i = 0, len = notes.length; i < len; i++) {
				this.sendMIDIMessage(JMB.NOTE_OFF, notes[i], noteVelocity);
			}
		},
		/**
		 * Send a MIDI message to the Jazz MIDI bridge for output.
		 *
		 * @return undefined
		 */
		sendMIDIMessage: function() {
			var msg = null, midiAccess = this.midiAccess, midiDevice = this.midiDevice;
			if(midiAccess) {
				msg = midiAccess.createMIDIMessage.apply(midiAccess, arguments);
				midiDevice.sendMIDIMessage(msg);
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
		}
	});

	return MidiComponent;
});
