/* global define: false */
define(['lodash', 'microevent', 'app/config'], function(_, MicroEvent, Config) {
	"use strict";

	var DEFAULT_KEY = Config.get('general.defaultKeyAndSignature');
	var KEY_SIGNATURE_MAP = Config.get('general.keySignatureMap');
	var KEY_MAP = Config.get('general.keyMap');
	var KEY_WHEEL = Config.get('general.keyWheel');

	// The KeySignature object is responsible for knowing the current key and
	// signature as well as how to spell and notate pitches with correct 
	// accidentals.
	//
	// It collaborates with the global configuration object that holds the 
	// mapping for keys and signatures as well as other relevant information. 
	//
	// This object is observable and Fires "change" events when the key or 
	// signature are changed using the change methods.
	//
	// Note
	// ----
	// From the user's point of view, there is only one "key," but in order
	// to notate the pitches with Vex.Flow, we must track the _keyOfSignature_
	// property. The _key_ property does not need to match _keyOfSignature_, 
	// although most of the time it will.
	//
	// The _key_ property should be considered a public, displayable property,
	// while the _keyOfSignature_ property is private.
	
	var KeySignature = function(key) {
		key = key || DEFAULT_KEY;
		this.lock = true;
		this.setKey(key);
		this.setKeyOfSignature(key);
		this.setSignature(this.keyToSignature(key));
	};

	_.extend(KeySignature.prototype, {
		//--------------------------------------------------
		// Public methods for changing/locking the key and signature

		// change the key value, optionally locking the signature to it
		changeKey: function(key, lock) {
			this.setKey(key);
			if(lock) {
				this.setKeyOfSignature(key);
				this.setSignature(this.keyToSignature(key));
			}
			this.lock = lock;
			this.trigger('change');
		},
		// change the signature key value, optionally locking the key to it
		changeSignatureKey: function(keyOfSignature, lock) {
			this.setKeyOfSignature(keyOfSignature);
			this.setSignature(this.keyToSignature(keyOfSignature));
			if(lock) {
				this.setKey(keyOfSignature);
			}
			this.lock = lock;
			this.trigger('change');
		},
		// returns true if the key and signature are locked, false otherwise 
		locked: function() {
			return this.lock ? true : false;
		},

		//--------------------------------------------------
		// Setters

		// sets the key 
		setKey: function(key) {
			if(!KEY_MAP.hasOwnProperty(key)) {
				throw new Error("invalid key");
			}
			this.key = key;
		},
		// set the signature
		setSignature: function(signatureSpec) {
			this.signatureSpec = signatureSpec;
			this.signature = this.specToSignature(signatureSpec);
		},
		// sets the key associated with the signature
		setKeyOfSignature: function(key) {
			this.keyOfSignature = key;
		},

		//--------------------------------------------------
		// Getters

		// returns the current key value
		getKey: function() {
			return this.key;
		},
		// returns the current key name
		getKeyName: function() {
			return this.keyToName(this.key);
		},
		// returns the current key short name
		getKeyShortName: function() {
			return this.keyToShortName(this.key);
		},
		// Translates the signature key name to one that is understandable by
		// the Vex.Flow key signature object. 
		getVexKey: function() {
			var key = this.keyOfSignature;
			var vexKey = key.slice(1).replace('_', '');
			var scale_type = key.charAt(0);

			// convert minor and major key types
			switch(scale_type) {
				case 'i':
					// minor key signified by "m"
					vexKey += 'm'; 
					break;
				case 'j':
					// major key, no adjustment necessary
					break;
				default:
			}

			return vexKey;
		},
		// returns the signature (ist of accidentals)
		getSignature: function() {
			return this.signature;
		},
		// returns the signature specification (string of sharps or flats)
		getSignatureSpec: function() {
			return this.signatureSpec;
		},
		// returns the key associated with the signature 
		getKeyOfSignature: function() {
			return this.keyOfSignature;
		},
		// Returns the current note spelling 
		getSpelling: function() {
			return this.keyToSpelling(this.keyOfSignature);
		},

		//--------------------------------------------------
		// Note spelling functions
		
		// returns true if the note needs a "natural" accidental
		// as a result of the current key signature, false otherwise
		needsNatural: function(note) {
			var i, len, signature = this.signature;
			for(i = 0, len = signature.length; i < len; i++) {
				if(signature[i].charAt(0) === note) {
					return true;
				}
			}
			return false;
		},
		// returns true if the note is contained in the key signature, false
		// otherwise
		signatureContains: function(note) {
			var i, len, signature = this.signature;
			for(i = 0, len = signature.length; i < len; i++) {
				if(signature[i] === note) {
					return true;
				}
			}
			return false;
		},

		//--------------------------------------------------
		// Key manipulation functions

		// Changes the key to one that is sharper.
		rotateSharpward: function() {
			this.rotateKey(1);
		},

		// Changes the key to one that is flatter.
		rotateFlatward: function() {
			this.rotateKey(-1);
		},

		// Rotates the key by moving left or right around the key wheel. 
		// Direction should be a positive integer to rotate to a sharper key,
		// or negative to rotate to a flatter key.
		rotateKey: function(direction) {
			var wheel = KEY_WHEEL.slice(0);
			var index = wheel.indexOf(this.getKey());
			if(index === -1) {
				index = 0;
			}
			var new_key = wheel[(wheel.length + index + direction) % wheel.length];
			this.changeKey(new_key, true);
		},

		//--------------------------------------------------
		// Utility functions

		// returns true if the signature is valid, false otherwise
		isSignatureSpec: function(spec) {
			var re = /^(?:b|#){0,7}$/; // string of sharp or flat symbols
			return re.test(spec); 
		},
		// return list of accidentals for the signature spec
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
		// returns the signature for a key
		keyToSignature: function(key) {
			return KEY_MAP[key].signature;
		},
		// returns the name for a key
		keyToName: function(key) {
			return KEY_MAP[key].name;
		},
		// returns the short name for a key
		keyToShortName: function(key) {
			return KEY_MAP[key].shortName;
		},
		// returns the note spelling based on the current key signature
		keyToSpelling: function(key) {
			return KEY_MAP[key].spelling;
		},
		// returns list of note accidentals in the correct order to notate 
		// the signature for sharps or flats
		orderOfAccidentals: function(accidental, num_accidentals) {
			var order = ["F","C","G","D","A","E","B"]; // order of sharps
			if(accidental === 'b') {
				order = order.reverse(); // reverse to notate flats 
			}
			return order.slice(0, num_accidentals);
		},
	});

	MicroEvent.mixin(KeySignature);

	return KeySignature;
});
