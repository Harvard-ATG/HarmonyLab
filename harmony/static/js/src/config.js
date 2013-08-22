// Configuration reader. 
//
// Configuration data should only be read using the
// interface provided by this module.

/* global define: false */
define([
	'lodash', 
	'app/config/general',
	'app/config/instruments',
	'app/config/keyboard_shortcuts'
], function(
	_, 
	ConfigGeneral, 
	ConfigInstruments,
	ConfigKeyboardShortcuts) {
	"use strict";

	var Config = {

		// private cache of config data
		__config: {
			'general': ConfigGeneral,
			'instruments': ConfigInstruments,
			'keyboardShortcuts': ConfigKeyboardShortcuts
		},

		// public method that returns the value of a key.
		//
		// For convenience, nested values may be retrieved 
		// using dot notation: get("x.y.z") => value of z.
		//
		get: function(key) {
			if(typeof key !== 'string') {
				throw new Error("Config key must be a string: " + key);
			}

			var config = this.__config;

			_.each(key.split('.'), function(value) {
				if(config.hasOwnProperty(value)) {
					config = config[value];
				} else {
					throw new Error("Key not found: " + key);
				}
			});

			return config;
		},
		set: function(key, value) {
			throw new Error("config is read-only");
		}
	};

	return Config;
});
