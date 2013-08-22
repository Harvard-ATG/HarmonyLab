// Module that defines the available MIDI INSTRUMENTS

/* global define: false */
define(['lodash', 'app/config'], function(_, Config) {
	"use strict";

	var INSTRUMENTS = Config.get('instruments');

	return {
		enabled: [0,6,16,52],
		numberOf: function(name) {
			var num;
			for(num in INSTRUMENTS) {
				if(INSTRUMENTS.hasOwnProperty(num) && 
					INSTRUMENTS[num].name.toLowerCase() === name.toLowerCase()) {
					return parseInt(num, 10);
				}
			}
			return -1;
		},
		getEnabled: function() {
			return _.map(this.enabled, function(num, index) {
				return { 
					num: num, 
					name: INSTRUMENTS[num].shortName || INSTRUMENTS[num].name
				};
			});
		}
	};
});
