// Module that defines the available MIDI INSTRUMENT_MAP

/* global define: false */
define(['lodash', 'app/config'], function(_, Config) {
	"use strict";

	var ENABLED = Config.get('instruments.enabled');
	var INSTRUMENT_MAP = Config.get('instruments.instrumentMap');

	return {
		numberOf: function(name) {
			var num;
			for(num in INSTRUMENT_MAP) {
				if(INSTRUMENT_MAP.hasOwnProperty(num) && 
					INSTRUMENT_MAP[num].name.toLowerCase() === name.toLowerCase()) {
					return parseInt(num, 10);
				}
			}
			return -1;
		},
		getEnabled: function() {
			return _.map(ENABLED, function(num, index) {
				return { 
					num: num, 
					name: INSTRUMENT_MAP[num].shortName || INSTRUMENT_MAP[num].name
				};
			});
		}
	};
});
