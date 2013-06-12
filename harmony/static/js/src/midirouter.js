define(['lodash', 'radio', 'jazzmidibridge'], function(_, radio, JMB) {

	/**
	 * The MIDI Router is responsible for translating and routing MIDI 
	 * messages from both external keyboard devices and onscreen devices.
	 *
	 * It directly interfaces with external devices using the Jazz Midi Bridge
	 * (JMB) and depends on the radio event bus to interface with other system 
	 * components. 
	 */
	var MIDIRouter = {
		/**
		 * Reference to the radio event bus.
		 */
		radio: radio,

		/**
		 * References to the midi output device and access interface
		 * provided by the Jazz Midi Bridge. These are initialized 
		 * through JMB.init(function() { ... }).
		 */
		midiOutput: null,
		midiAccess: null,

		/**
		 * Initializes the MIDI router to send and receive MIDI messages.
		 *
		 * @return {this}
		 */
		init: function() {
			JMB.init(_.bind(this.onJMBInit, this));
			return this;
		},
		/**
		 * Initializes the Jazz Midi Bridge (JMB) and related event handlers.
		 *
		 * @param {object} MIDIAccess object
		 */
		onJMBInit: function(MIDIAccess) {
			this.midiAccess = MIDIAccess;
			this.midiOutput = MIDIAccess.getOutput(0);

			if(this.midiOutput === false) {
				console.log("No midi output device available.");
			} else {
				this.initListeners();
			}
		},
		/**
		 * Initializes listeners.
		 *
		 * Note: this should only be done if a MIDI output device has been selected.
		 */
		initListeners: function() {
			this.radio('noteMidiOutput').subscribe([this.onNoteOutput, this])
		},
		/**
		 * Handles note on/off events by creating and transmitting the
		 * appropriate MIDI message.
		 *
		 * @param {string} noteState on|off
		 * @param {integer} noteNumber the midi note number
		 * @param {integer} noteVelocity defaults to 100
		 */
		onNoteOutput: function(noteState, noteNumber, noteVelocity) {
			var midiMessage, midiCommand;
			midiCommand = (noteState === 'on' ? JMB.NOTE_ON : JMB.NOTE_OFF);
			noteVelocity = noteVelocity || 100;
			midiMessage = this.midiAccess.createMIDIMessage(midiCommand, noteNumber, noteVelocity);

			this.midiOutput.sendMIDIMessage(midiMessage);
			this.radio('noteDraw').broadcast(noteState, noteNumber, noteVelocity);
		}
	};

	return MIDIRouter;
});
