/**
 * Piano keyboard UI.
 */
define([
	'jquery', 
	'lodash', 
	'raphael',
	'app/models/keyboard_generator',
	'app/components/events',
	'app/components/component',
	'./key'
], function(
	$, 
	_, 
	Raphael,
	KeyboardGenerator,
	EVENTS,
	Component,
	KeyComponent
) {

	/**
	 * Creates an instance of a KeyboardComponent.
	 *
	 * This object is reponsible for displaying the on-screen keyboard UI that
	 * users can interact with. It is composed of KeyComponent objects that
	 * make up the keyboard. 
	 *
	 * The KeyboardComponent is responsible for coordinating the flow of note 
	 * ON/OFF messages to/from KeyComponents.
	 *
	 * @constructor
	 * @param {integer} settings.numberOfKeys The total number of keys on the keyboard.
	 */
	var KeyboardComponent = function(settings) {
		this.settings = settings || {};
	};

	KeyboardComponent.prototype = new Component();

	_.extend(KeyboardComponent.prototype, {
		defaultWidth: 870,
		defaultHeight: 120,
		defaultSmallHeight: 80,
		defaultKeyWidth: 30,
		numberOfKeys: 49,
		initComponent: function() {
			if("numberOfKeys" in this.settings) {
				this.numberOfKeys = this.settings.numberOfKeys;
			} 

			this.keyboardGenerator = new KeyboardGenerator(this.numberOfKeys);
			this.layout = this.getLayout();
			this.keyComponents = this.makeKeyComponents();
			this.keyMap = this.mapKeysByNumber(this.keyComponents);

			this.keyboardEl = $('<div class="keyboard"></div>');
			this.el = $('<div class="keyboard-area"></div>');
			this.el.append(this.keyboardEl);
			this.paper = Raphael(this.keyboardEl.get(0), this.layout.width, this.layout.height);

			_.bindAll(this, [
				'onPedalChange', 
				'onNoteChange', 
				'onClearNotes',
				'triggerNoteChange'
			]);

			this.initListeners();
		},
		/**
		 * Initialize listeners.
		 *
		 * @return undefined
		 */
		initListeners: function() {
			this.subscribe(EVENTS.BROADCAST.NOTE, this.onNoteChange);
			this.subscribe(EVENTS.BROADCAST.CLEAR_NOTES, this.onClearNotes);
			this.subscribe(EVENTS.BROADCAST.PEDAL, this.onPedalChange);
			this.bind('key', this.triggerNoteChange);
		},
		/**
		 * Removes all listeners.
		 *
		 * @return undefined
		 */
		removeListeners: function() {
			this.unsubscribe(EVENTS.BROADCAST.NOTE, this.onNoteChange);
			this.unsubscribe(EVENTS.BROADCAST.CLEAR_NOTES, this.onClearNotes);
			this.unsubscribe(EVENTS.BROADCAST.PEDAL, this.onPedalChange);
			this.unbind('key', this.triggerNoteChange);
		},
		/**
		 * Returns a layout configuration that constrains the width so that 
		 * the keyboard fits on screen.
		 *
		 * Note: in particular, this should force the 88-key keyboard to 
		 * shrink to fit on screen.
		 *
		 * @return undefined
		 */
		getLayout: function() {
			var layoutConfig = {};
			var numWhiteKeys = this.getNumWhiteKeys();

			if(this.defaultWidth >= numWhiteKeys * this.defaultKeyWidth) {
				layoutConfig.width = (numWhiteKeys * this.defaultKeyWidth);
				layoutConfig.keyWidth = this.defaultKeyWidth;
			} else {
				layoutConfig.width = this.defaultWidth;
				layoutConfig.keyWidth = (this.defaultWidth / numWhiteKeys);
			}

			layoutConfig.height = (window.screen.height <= 768 ? this.defaultSmallHeight: this.defaultHeight); 

			return layoutConfig;
		},
		/**
		 * Fires a note change event on the event bus.
		 *
		 * @return undefined
		 */
		triggerNoteChange: function() {
			var args = Array.prototype.slice.call(arguments);
			args.unshift(EVENTS.BROADCAST.NOTE);
			this.broadcast.apply(this, args);
		},
		/**
		 * Listens for note change events from the event bus.
		 * Performs the associated action (press/release) on the key with 
		 * that note number.
		 *
		 * @return undefined
		 */
		onNoteChange: function(noteState, noteNumber, noteVelocity) {
			var key = this.getKeyByNumber(noteNumber);
			if(typeof key !== 'undefined') {
				key[noteState==='on'?'press':'release']();
			}
		},
		/**
		 * Clears all keys.
		 *
		 * @return undefined
		 */
		onClearNotes: function() {
			this.clearKeys();
		},
		/*
		 * Handles pedal changes.
		 *
		 * @return undefined
		 */
		onPedalChange: function(pedal, state) {
			var enabled = (state === 'on');
			if(pedal === 'sustain') { 
				_.invoke(this.keyComponents, "setSustain", enabled);
			}
		},
		/**
		 * Generates piano key components.
		 *
		 * @return {array}
		 */
		makeKeyComponents: function() {
			var that = this;
			var keys = [];
			var whiteIndex = 0;

			_.each(this.keyboardGenerator.keySpecs, function(keySpec, index) {
				var keyComponent = KeyComponent.create({
					isWhite: keySpec.isWhite,
					whiteKeyIndex: whiteIndex,
					noteNumber: keySpec.noteNumber
				});
				keyComponent.init(that);
				keys.push(keyComponent);

				if(keySpec.isWhite) {
					whiteIndex++;
				}
			});

			return keys;
		},
		/**
		 * Clears each piano key.
		 *
		 * @return undefined
		 */
		clearKeys: function() {
			_.invoke(this.keyComponents, 'clear');
		},
		/**
		 * Returns the total number of keys.
		 *
		 * @return {number}
		 */
		getNumKeys: function() {
			return this.numberOfKeys;
		},
		/**
		 * Returns a key object given a note number.
		 *
		 * @return {PianoKey}
		 */
		getKeyByNumber: function(noteNumber) {
			return this.keyMap[noteNumber];
		},
		/**
		 * Maps note numbers to keys.
		 *
		 * @return {object}
		 */
		mapKeysByNumber: function(keys) {
			return _.zipObject(_.pluck(keys, 'noteNumber'), keys);
		},
		/**
		 * Returns the total number of white keys on the keyboard.
		 *
		 * @return {number}
		 */
		getNumWhiteKeys: function() {
			return this.keyboardGenerator.getNumWhiteKeys();
		},
		/**
		 * Renders the keyboard.
		 *
		 * @return this
		 */
		render: function() {
			var width = this.layout.width;
			var height = this.layout.height;
			var keyWidth = this.layout.keyWidth;
			var paper = this.paper;

			// render keyboard container
			paper.rect(0, 0, width, height).attr('stroke-width', 2);

			// render keys 
			_.invoke(this.keyComponents, "render", paper, keyWidth, width, height);

			return this;
		},
		/**
		 * Destroys the keyboard.
		 * 
		 * @return undefined
		 */
		destroy: function() {
			this.removeListeners();			
			_.invoke(this.keyComponents, 'destroy');
			this.paper.clear();
			this.keyboardEl.remove();
			this.el.remove();
			this.keyboardGenerator = null;
			this.keyMap = null;
			this.layout = null;
			this.settings = null;
		}
	});

	return KeyboardComponent;
});
