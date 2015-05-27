/* global define: false */
define([
	'lodash', 
	'microevent', 
	'app/config'
], function(
	_,
	MicroEvent, 
	Config
) {
	"use strict";

	/**
	 * Defines the default key.
	 * @type {string}
	 * @const
	 */
	var DEFAULT_KEY = Config.get('general.defaultKeyAndSignature');
	/**
	 * Defines a mapping of signatures to keys.
	 * @type {object}
	 * @const
	 */
	var KEY_SIGNATURE_MAP = Config.get('general.keySignatureMap');
	/**
	 * Defines a mapping of keys to information related to the key such as
	 * spellings, etc.
	 * @type {object}
	 * @const
	 */
	var KEY_MAP = Config.get('general.keyMap');
	/**
	 * Defines an array of key strings that form a "wheel" that may be rotated
	 * left or right (think circle of fifths). 
	 * @type {array}
	 * @const
	 */
	var KEY_WHEEL = Config.get('general.keyWheel');
	/**
	 * Defines the order of sharps.
	 * @type {array}
	 * @const
	 */
	var ORDER_OF_SHARPS = Config.get('general.orderOfSharps'); 

	/**
	 * Creates an instance of a key signature.
	 *
	 * The key signature object is responsible for knowing the current key and
	 * signature and how to manipulate both together and separately. It depends 
	 * on configuration data to define both the keys and signatures.
	 *
	 * Note that there are two "keys" that are tracked by this object, which may be
	 * "locked" together and change in tandem, or unlocked and change
	 * independently. The key generally determines the signature, although this
	 * is not always the case. The signature does *not* determine the key,
	 * because a signature can be mapped to two keys, major or minor. In order
	 * to notate the signature with Vex.Flow, we must map the signature to a
	 * key. This arbitrary mapping is defined in the config.
	 *
	 * Usage is confined to these public methods:
	 *	- changeKey()
	 *	- changeSignatureKey()
	 *	- locked()
	 * 
	 * @mixes MicroEvent
	 * @fires change
	 * @constructor
	 */
	var KeySignature = function(key, keySignature) {
		/**
		 * Lock flag. When true, locks the key to the signature.
		 * @type {boolean}
		 * @default true
		 * @protected
		 */
		this.lock = true;
		/**
		 * Defines the key.
		 * @type {string}
		 * @protected
		 */
		this.key = '';
		/**
		 * Specification for the signature. A string with a number of #'s that
		 * represent the number of sharps, or a string with a number of b's that
		 * represent the number of flats (it can only be sharps or flats, not
		 * both).
		 * @type {string}
		 * @protected
		 */
		this.signatureSpec  = '';
		/** 
		 * Defines the signature, which is a sequence of notes with accidentals 
		 * that should be sharped or flatted. 
		 * @type {array}
		 * @protected
		 */
		this.signature = [];
		/**
		 * Defines the key that the signature is mapped to (arbitrary mapping
		 * since the signature doesn't map 1:1 to a key).
		 * @type {string}
		 * @protected
		 */
		this.keyOfSignature = null;

		this.init(key, keySignature);
	};

	_.extend(KeySignature.prototype, {
		/**
		 * Initializes the key signature.
		 *
		 * @param {string} key
		 * @return undefined
		 */
		init: function(key, keySignature) {
			key = key || DEFAULT_KEY;
			this.setKey(key);
			if(typeof keySignature == "string") {
				this.setKeyOfSignature(this.signatureToKey(keySignature));
				this.setSignature(keySignature);
				this.lock = false;
			} else {
				this.setKeyOfSignature(key);
				this.setSignature(this.keyToSignature(key));
			}
		},
		/**
		 * Change the key value. When lock is true, sets the signature to match
		 * the key.
		 *
		 * @param {string} key
		 * @param {boolean} lock
		 * @return undefined
		 * @fires change
		 * @public
		 */
		changeKey: function(key, lock) {
			this.setKey(key);
			if(lock) {
				this.setKeyOfSignature(key);
				this.setSignature(this.keyToSignature(key));
			}
			this.lock = lock;
			this.trigger('change');
		},
		/**
		 * Change the signature key value. When lock is true, sets the key to
		 * match the signature.
		 *
		 * @param {string} keyOfSignature
		 * @param {boolean} lock
		 * @return undefined
		 * @fires change
		 * @public
		 */
		changeSignatureKey: function(keyOfSignature, lock) {
			this.setKeyOfSignature(keyOfSignature);
			this.setSignature(this.keyToSignature(keyOfSignature));
			if(lock) {
				this.setKey(keyOfSignature);
			}
			this.lock = lock;
			this.trigger('change');
		},
		/**
		 * Changes the "lock" status.
		 *
		 * @param {boolean} isLocked
		 * @return undefined
		 * @public
		 */
		changeSignatureLock: function(isLocked) {
			if (typeof isLocked !== "boolean") {
				throw new Error("invalid param isLocked: must be a boolean type: true|false")
			}
			this.lock = isLocked ? true : false;
		},
		/**
		 * Returns true if the key and signature are locked together, false
		 * otherwise.
		 *
		 * @return {boolean}
		 * @public
		 */
		locked: function() {
			return this.lock ? true : false;
		},

		//--------------------------------------------------
		// Setters

		/**
		 * Sets the key. 
		 *
		 * @param key
		 * @throws {Error} Will throw an error if the key is not
		 * valid/supported.
		 * @return undefined
		 */
		setKey: function(key) {
			if(!KEY_MAP.hasOwnProperty(key)) {
				throw new Error("invalid key");
			}
			this.key = key;
		},
		/**
		 * Sets the signature given a specification.
		 *
		 * @param {string} signatureSpec Sequence of #'s or b's.
		 * @return undefined
		 */
		setSignature: function(signatureSpec) {
			this.signatureSpec = signatureSpec;
			this.signature = this.specToSignature(signatureSpec);
		},
		/**
		 * Sets the key of the signature given a key.
		 *
		 * @param {string} key
		 * @return undefined
		 */
		setKeyOfSignature: function(key) {
			this.keyOfSignature = key;
		},

		//--------------------------------------------------
		// Getters

		/**
		 * Returns the current key value.
		 *
		 * @return {string} 
		 */
		getKey: function() {
			return this.key;
		},
		/**
		 * Returns the current key name.
		 *
		 * @return {string}
		 */
		getKeyName: function() {
			return this.keyToName(this.key);
		},
		/**
		 * Returns the current key short name.
		 *
		 * @return {string}
		 */
		getKeyShortName: function() {
			return this.keyToShortName(this.key);
		},
		/**
		 * Returns the current key pitch class.
		 *
		 * @return {number}
		 */
		getKeyPitchClass: function() {
			return this.keyToPitchClass(this.key);
		},
		/**
		 * Returns the current key name as a key spec understood by
		 * a Vex.Flow.KeySignature object.
		 *
		 * @return {string}
		 */
		getVexKey: function() {
			var key = this.keyOfSignature; 
			var vex_key, scale_type;

			// SPECIAL CASE: "no key" should be mapped to C major for Vex.Flow.
			if(key === 'h') {
				key = 'jC_';
			}

			vex_key = key.slice(1).replace('_', '');
			scale_type = key.charAt(0);

			// convert minor and major key types
			switch(scale_type) {
				case 'i':
					// minor key signified by "m"
					vex_key += 'm'; 
					break;
				case 'j':
					// major key, no adjustment necessary
					break;
				default:
			}

			return vex_key;
		},
		/**
		 * Returns the signature, an array of notes with accidentals.
		 *
		 * @return {array}
		 */
		getSignature: function() {
			return this.signature;
		},
		/**
		 * Returns the signature specification.
		 *
		 * @return {string}
		 */
		getSignatureSpec: function() {
			return this.signatureSpec;
		},
		/**
		 * Returns the key of the associated signature.
		 *
		 * @return {string}
		 */
		getKeyOfSignature: function() {
			return this.keyOfSignature;
		},
		/**
		 * Returns the spelling for the current signature. The spelling is a
		 * sequence of notes and accidentals. 
		 *
		 * @return {array}
		 */
		getSpelling: function() {
			return this.keyToSpelling(this.keyOfSignature);
		},
		/**
		 * Returns true if the current key is minor, false otherwise
		 *
		 * @return {boolean}
		 */
		isMinorKey: function() {
			return this.keyIsMinor(this.key);
		},
		/**
		 * Returns true if the current key is major, false otherwise.
		 *
		 * @return {boolean}
		 */
		isMajorKey: function() {
			return this.keyIsMajor(this.key); 
		},

		//--------------------------------------------------
		// Note spelling functions
		
		/**
		 * Returns true if the given note needs a "natural" accidental as a
		 * result of the current key signature, false otherwise.
		 *
		 * @param {string} note
		 * @return {boolean}
		 */
		needsNatural: function(note) {
			var i, len, signature = this.signature;
			for(i = 0, len = signature.length; i < len; i++) {
				if(signature[i].charAt(0).toLowerCase() === note.toLowerCase()) {
					return true;
				}
			}
			return false;
		},
		/**
		 * Returns true if the note is contained in the key signature, false
		 * otherwise.
		 *
		 * @param {string} note
		 * @return {boolean}
		 */
		signatureContains: function(note) {
			var i, len, signature = this.signature;
			for(i = 0, len = signature.length; i < len; i++) {
				if(signature[i].toLowerCase() === note.toLowerCase()) {
					return true;
				}
			}
			return false;
		},

		//--------------------------------------------------
		// Key manipulation functions

		/**
		 * Sharpens the key using the current key wheel.
		 *
		 * @return undefined
		 */
		rotateSharpward: function() {
			this.rotateKey(1);
		},
		/**
		 * Flattens the key using the current key wheel.
		 *
		 * @return undefined
		 */
		rotateFlatward: function() {
			this.rotateKey(-1);
		},

		/**
		 * Rotates the key in the specified direction using the current key
		 * wheel. The direction should be a positive or negative integer. 
		 *
		 * @param {number} direction Positive or negative integer.
		 * @return undefined
		 */
		rotateKey: function(direction) {
			var wheel = KEY_WHEEL.slice(0);
			var index = wheel.indexOf(this.getKey());
			if(index === -1) {
				index = 0;
			}
			var new_key = wheel[(wheel.length + index + direction) % wheel.length];
			this.changeKey(new_key, this.locked());
		},

		//--------------------------------------------------
		// Utility functions

		/**
		 * Returns true if the signature specification is valid, false
		 * otherwise.
		 *
		 * @param {string} spec
		 * @return {boolean}
		 */
		isSignatureSpec: function(spec) {
			var re = /^(?:b|#){0,7}$/; // string of sharp or flat symbols
			return re.test(spec); 
		},
		/**
		 * Return list of accidentals for the signature spec.
		 *
		 * @param {string} signatureSpec
		 * @return {array}
		 */
		specToSignature: function(signatureSpec) {
			if(!this.isSignatureSpec(signatureSpec)) {
				throw new Error("invalid signature");
			}

			var accidental = signatureSpec.charAt(0) || '';
			var num_accidentals = signatureSpec.length;
			var notes = this.orderOfAccidentals(accidental, num_accidentals);

			return _.map(notes, function(note) {
				return note + accidental;
			});
		},
		/**
		 * Returns the signature for a key.
		 *
		 * @param {string} key
		 * @return {array}
		 */
		keyToSignature: function(key) {
			return KEY_MAP[key].signature;
		},
		/**
		 * Returns the key name.
		 *
		 * @param {string} key
		 * @return {string}
		 */
		keyToName: function(key) {
			return KEY_MAP[key].name;
		},
		/**
		 * Returns the short name for a key.
		 *
		 * @param {string} key
		 * @return {string}
		 */
		keyToShortName: function(key) {
			return KEY_MAP[key].shortName;
		},
		/**
		 * Returns the pitch class for a key.
		 *
		 * @param {string} key
		 * @return {number}
		 */
		keyToPitchClass: function(key) {
			return KEY_MAP[key].pitchClass;
		},
		/**
		 * Returns the note spelling based on the current key signature.
		 *
		 * @param {string} key
		 * @return {array}
		 */
		keyToSpelling: function(key) {
			return KEY_MAP[key].spelling;
		},
		/**
		 * Returns true if the key is major, false otherwise.
		 *
		 * @param {string} key
		 * @return {boolean}
		 */
		keyIsMajor: function(key) {
			 return key.indexOf('j') === 0;
		},
		/**
		 * Returns true if the key is minor, false otherwise.
		 *
		 * @param {string} key
		 * @return {boolean}
		 */
		keyIsMinor: function(key) {
			 return key.indexOf('i') === 0;
		},
		/**
		 * Returns the key for a signature.
		 *
		 * @param {string} signature string of sharps or flats
		 * @return {string} strint representing the key
		 */
		signatureToKey: function(signature) {
			if(!(signature in KEY_SIGNATURE_MAP)) {
				throw new Error("invalid signature: " + signature);
			}
			return KEY_SIGNATURE_MAP[signature];
		},
		/**
		 * Returns list of note accidentals in the correct order to notate 
		 * the signature for sharps or flats.
		 *
		 * @param {string} accidental
		 * @param {number} numAccidentals
		 * @return {array}
		 */
		orderOfAccidentals: function(accidental, numAccidentals) {
			var order = _.cloneDeep(ORDER_OF_SHARPS);
			if(accidental === 'b') {
				order = order.reverse(); // reverse to notate flats 
			}
			return order.slice(0, numAccidentals);
		}
	});

	MicroEvent.mixin(KeySignature);

	return KeySignature;
});
