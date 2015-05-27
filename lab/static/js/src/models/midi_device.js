define([
	'lodash',
	'microevent'
], function(
	_,
	MicroEvent
) {

	/**
	 * MidiDevice object is responsible for knowing the MIDI input/output
	 * devices that are available for sending/receiving messages.
	 *
	 * @mixes MicroEvent
	 * @fires updated when the list of devices is updated or changed
	 * @fires cleared when the lsit of devices is cleared
	 * @constructor
	 */
	var MidiDevice = function() {
		this.inputs = [];
		this.outputs = [];
		this._input = false;
		this._inputidx = false;
		this._output = false;
		this._outputidx = false;
		_.bindAll(this, ['handleMIDIMessage','update']);
	};

	/**
	 * Sets a callback that will be called when the update() method
	 * is called. 
	 *
	 * @param {Function} callback
	 * @return undefined
	 */
	MidiDevice.prototype.setUpdater = function(callback) {
		this._updater = callback;
	};

	/**
	 * Calls the updater callback that will update the device.
	 *
	 * @fires updated
	 * @return undefined
	 */
	MidiDevice.prototype.update = function() {
		if(this._updater) {
			this._updater();
			this.trigger("updated", this);
		}
	};

	/**
	 * Sets the sources for input/output.
	 *
	 * @param {array} inputs
	 * @param {array} outputs
	 * @return undefined
	 */
	MidiDevice.prototype.setSources = function(inputs, outputs) {
		this.inputs = inputs || [];
		this.outputs = outputs || [];
	};

	/**
	 * Returns the inputs.
	 *
	 * @return array
	 */
	MidiDevice.prototype.getInputs = function() {
		return this.inputs;
	};

	/**
	 * Returns the outputs.
	 *
	 * @return array
	 */
	MidiDevice.prototype.getOutputs = function() {
		return this.outputs;
	};

	/**
	 * Selects an input device to be used.
	 *
	 * @param {number} index
	 * @return array
	 */
	MidiDevice.prototype.selectInput = function(index) {
		if(this.isValidSelection(this.inputs, index)) {
			this._inputidx = index;
			this._input = this.inputs[index];
			this.addInputListener();
			return true;
		} 
		return false;
	};

	/**
	 * Selects an output device to be used.
	 *
	 * @param {number} index
	 * @return array
	 */
	MidiDevice.prototype.selectOutput = function(index) {
		if(this.isValidSelection(this.outputs, index)) {
			this._outputidx = index;
			this._output = this.outputs[index];
			return true;
		} 
		return false;
	};

	/**
	 * Selects the default input/output devices.
	 *
	 * @return undefined
	 */
	MidiDevice.prototype.selectDefaults = function() {
		this.selectInput(0);
		this.selectOutput(0);
	};

	/**
	 * Checks if the index is a valid selection from the list of sources.
	 *
	 * @param {number} index
	 * @return {boolean}
	 */
	MidiDevice.prototype.isValidSelection = function(sources, index) {
		var size = sources.length;
		return index >= 0 && (index <= size - 1) && size > 0;
	};

	/**
	 * Returns the currently select input device.
	 *
	 * @return {object} or false if there is none
	 */
	MidiDevice.prototype.getSelectedInput = function() {
		if(this._input) {
			return this.inputs[this._inputidx];
		}
		return false;
	};

	/**
	 * Returns the currently select output device.
	 *
	 * @return {object} or false if there is none
	 */
	MidiDevice.prototype.getSelectedOutput = function() {
		if(this._output) {
			return this.outputs[this._outputidx];
		}
		return false;
	};

	/**
	 * Adds the input listener for midi messages.
	 *
	 * @return undefined
	 */
	MidiDevice.prototype.addInputListener = function() {
		if(this._input) {
			this._input.addEventListener('midimessage', this.handleMIDIMessage);
		}
	};

	/**
	 * Receives the MIDI message from the input device and triggers it
	 * so that interested subscribers can act on it. 
	 *
	 * @return undefined
	 */
	MidiDevice.prototype.handleMIDIMessage = function(msg) {
		this.trigger("midimessage", msg);
	};

	/**
	 * Sends a MIDI message to the output device.
	 *
	 * @return undefined
	 */
	MidiDevice.prototype.sendMIDIMessage = function(msg) {
		if(this._output) {
			this._output.sendMIDIMessage(msg);
		}
	};

	/**
	 * Clears the devices.
	 *
	 * @fires clear
	 * @return undefined
	 */
	MidiDevice.prototype.clear = function() {
		this._inputidx = 0;
		this._outputidx = 0;
		this.inputs = [];
		this.outputs = [];
		this.trigger("clear");
	};

	MicroEvent.mixin(MidiDevice);

	return MidiDevice;
});
