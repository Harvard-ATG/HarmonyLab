/**
 * @fileoverview Defines a namespace for common utility functions.
 */
define(['lodash'], function(_) {

	/**
	 * Defines a namespace for utility functions.
	 *
	 * @namespace
	 */
	var util = {

		/**
		 * Returns the application-specific static URL for a given path.
		 *
		 * Note, this function depends on the global window.appStaticUrl
		 * property. The application must initialize this value, otherwise
		 * it will return the path appended to the default static URL.
		 *
		 * @param {string} path
		 * @return {string} The static URL.
		 */
		staticUrl: function(path) {
			path = path || '';
			var defaultStaticUrl = '/static/';
			var staticUrl = window.appStaticUrl || defaultStaticUrl;
			return staticUrl + path;
		},
		/**
		 * Converts or maps symbols in a text string to unicode characters.
		 *
		 * This method is primarily used in rendering musical analysis.
		 *
		 * @param {string} text
		 * @return {string} Text with the symbols replaced with their unicode
		 * values.
		 */
		convertSymbols: function(text) {
			var rules = [
				[/&dim;/g,"\u00b0"],// diminished and half-diminished signs
				[/&hdim;/g,"\u2300"],
				[/&3;/g,"\u00b3"],// figured bass
				[/&6;/g,"\u2076"],
				[/&7;/g,"\u2077"],
				[/&42;/g,"\u2074\u2082"],
				[/&43;/g,"\u2074\u2083"],
				[/&52;/g,"\u2075\u2082"],
				[/&53;/g,"\u2075\u2083"],
				[/&54;/g,"\u2075\u2084"],
				[/&64;/g,"\u2076\u2084"],
				[/&65;/g,"\u2076\u2085"],
				[/&73;/g,"\u2077\u2083"],
				[/&75;/g,"\u2077\u2085"],
				//[/&d5;/g,"5\u0337"],// figured bass chord of the false fifth
				//[/&d7;/g,"7\u0337"],// figured bass diminished seveth
				//[/&b;/g,"\u266d"],// flat
				//[/&#;/g,"\u266f"],// sharp
				//[/&n;/g,"\u266e"],// natural
				//[/&bb;/g,"\ud834\udd2b"],// double flat
				//[/&##;/g,"\ud834\udd2A"],// double sharp
				//['&nbsp;', '']
			];
			var i, rule, len;

			for(i = 0, len = rules.length; i < len; i++) {
				rule = rules[i];
				text = text.replace(rule[0], rule[1]);
			}

			return text;
		},
		/**
		 * Takes an HSL triplet (hue, saturation, color) and returns the
		 * equivalent color string suitable for CSS/Canvas.
		 *
		 * @param {Array} color The [H,S,L] triplet.
		 * @return {string}
		 */
		toHSLString: function(color) {
			return 'hsl('+color[0]+','+color[1]+'%,'+color[2]+'%)';
		},
		/**
		 * Relays event(s) from a source to a destination object.
		 *
		 * @param {array} events A list of event names to relay.
		 * @param {object} src A source of the events to relay.
		 * @param {object} dest A dstination object to fire the events.
		 * @return {object} A mapping of event names to callbacks used to relay events.
		 */
		relayEvents: function(events, src, dest) {
			var __slice = Array.prototype.slice;

			var relay_map = _.reduce(events, function(map, eventName) {
				map[eventName] = function() {
					var args = __slice.call(arguments, 0);
					args.unshift(eventName);
					dest.trigger.apply(dest, args);
				};
				return map;
			}, {});

			_.each(relay_map, function(callback, eventName) {
				src.bind(eventName, callback);
			});

			return relay_map;
		},
		/**
		 * Unrelays event(s) from a source object.
		 *
		 * @param {object} relayMap A mapping of events to callbacks.
		 * @param {object} src A source of the events to relay.
		 * @return undefined;
		 */
		unrelayEvents: function(relayMap, src) {
			_.each(relayMap, function(callback, eventName) {
				src.unbind(eventName, callback);
			});
		},
		/**
		 * Creates an audio element with one or more source elements.
		 *
		 * @param {array} sources A list of source urls
		 * @return audio element
		 */
		createAudio: function(sources) {
			var audio = document.createElement('audio');
			_.each(sources, function(src) {
				var source = document.createElement('source');
				var type = (src.match(/ogg$/) ? 'audio/ogg' : 'audio/mp3');
				source.src = src;
				source.type = type;
				audio.appendChild(source);
			});
			return audio;
		},
		/**
		 * Word wrap.
		 *
		 * This method attempts to wrap text on word boundaries, 
		 * only splitting words when absolutely necessary.
		 *
		 * @param {string} text the source string
		 * @param {number} width maximum width of the text (default 75)
		 * @return {array} An array of lines
		 */
		wrapText: function(text, width) {
			width = width || 75;

			if(typeof text !== 'string') {
				throw new Error("text must be a string");
			}
			if (!text || !width || width < 0) {
				return [text];
			}

			var regex = '.{1,' + width + '}(\\b|$)|.{' + width + '}';

			return text.match(RegExp(regex, 'g'));
		}
	};

	return util;
});
