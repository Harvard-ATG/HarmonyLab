/**
 * @fileoverview Defines an interface for reading app configuration values. 
 */
define([
	'lodash', 
	'app/config/general',
	'app/config/help_text',
	'app/config/highlight',
	'app/config/instruments',
	'app/config/keyboard_shortcuts',
	'app/config/analysis/hChords',
	'app/config/analysis/hIntervals',
	'app/config/analysis/iChords',
	'app/config/analysis/iDegrees',
	'app/config/analysis/ijIntervals',
	'app/config/analysis/jChords',
	'app/config/analysis/jDegrees'
], function(
	_, 
	ConfigGeneral, 
	ConfigHelpText,
	ConfigHighlight,
	ConfigInstruments,
	ConfigKeyboardShortcuts,
	ConfigAnalysis_hChords,
	ConfigAnalysis_hIntervals,
	ConfigAnalysis_iChords,
	ConfigAnalysis_iDegrees,
	ConfigAnalysis_ijIntervals,
	ConfigAnalysis_jChords,
	ConfigAnalysis_jDegrees
) {
	"use strict";

	/**
	 * Creates an instance of a ConfigError exception.
	 *
	 * @constructor
	 */
	var ConfigError = function() {
		Error.apply(this, arguments);
	};
	ConfigError.prototype = new Error();
	ConfigError.prototype.constructor = ConfigError;
	ConfigError.prototype.name = 'ConfigError';

	/**
	 * Defines an interface to retrieve config values.
	 *
	 * @namespace Config
	 */
	var Config = {
		
		/**
		 * Key separator for specifying nested values. Defaults to period.
		 */
		keySeparator: '.',

		/** @private **/
		__config: {
			'general': ConfigGeneral,
			'helpText': ConfigHelpText,
			'highlight': ConfigHighlight,
			'instruments': ConfigInstruments,
			'keyboardShortcuts': ConfigKeyboardShortcuts,
			'analysis': {
				'hChords': ConfigAnalysis_hChords,		
				'hIntervals': ConfigAnalysis_hIntervals,		
				'iChords': ConfigAnalysis_iChords,
				'iDegrees': ConfigAnalysis_iDegrees,
				'ijIntervals': ConfigAnalysis_ijIntervals,
				'jChords': ConfigAnalysis_jChords,
				'jDegrees': ConfigAnalysis_jDegrees
			}
		},

		/**
		 * Retrieves a config value.
		 *
		 * Use dot notation in the key string to retrieve nested config values. 
		 * For example, specifying key "x.y.z" will return the value of "z"
		 * nested under "x" and "y."
		 *
		 * @param {string} key The dot-separated config value to retrieve.
		 * @return The configuration value.
		 * @throws {ConfigError} Will throw an error if the key is invalid.
		 */
		get: function(key) {
			if(typeof key !== 'string') {
				throw new ConfigError("Invalid parameter. Config key must be a string.");
			}

			var config = this.__config;
			var ks = this.keySeparator;
			var result, value;

			// lookup the key value
			result = _.reduce(key.split(ks), function(o, key) {
				if(o.value.hasOwnProperty(key)) {
					o.value = o.value[key];
					o.path.push(key);
				} else {
					throw new ConfigError("Invalid config key. No such config value at: " + o.path.join(ks));
				}
				return o;
			}, {value: config, path: []});

			// this copies the value to prevent or at least localize issues
			// that might occur if the config reference is modified by accident
			value = _.cloneDeep(result.value);

			return value;
		}
	};

	return Config;
});
