define(function() {

    var FontParser = {
        /**
         * Parses a string of text to locate sub-strings that require a
         * different font.
         *
         * This assumes there are two choices for font:
         * 		1. the standard text font (i.e. Helvetica, etc).
         *		2. some special font for the parsed sub-strings.
         * 
         * Text that uses font #2 should be wrapped in brackets: "{TEXT}".
         *
         * This is very similar to the way templating engines work except all we're doing is
         * identifying the sub-strings that require a different font, rather than substituting
         * text for the sub-strings.
         *
         * Example: 
         * 		Input string: "foo{5e}bar{6q}++" 
         * 		Tokens: ["foo", "{5e}", "bar", "{6q}", "++"]
         * 		Output: [
         * 		  {str:"foo",token:false},
         * 		  {str:"5e",token:true},
         * 		  {str:"bar",token:false},
         * 		  {str:"6q",token:true},
         * 		  {str:"++",token:false},
         * 		]
         *
         * @param {string} str  - the string to draw
         * @param {function} callback - optionally called on each token
         * @return array of results, or result of calling callback on each result
         */
        parse:  function(str, callback) {
            callback = callback || false;
            var re =  /([^{}]+|(\{[^{}]+\}))/g;
            var m, text, result, results = [];

            while ((m = re.exec(str)) != null) {
                if (m.index === re.lastIndex) {
                    re.lastIndex++;
                }
                
                text = m[1];
                if(text == "" || typeof text == "undefined") {
                    continue;
                }

                if(text.charAt(0) == "{" && text.charAt(text.length-1) == "}") {
                    result = {str: text.substr(1, text.length-2), token: true};
                } else {
                    result = {str: text, token: false};
                }
                
                
                
                if (callback) {
                    results.push(callback(result.str, result.token));
                } else {
                    results.push(result);
                }
            }
            
            return results;
        },
        /**
         * Convenience function that parses the string and returns
         * HTML markup for strings that require the figured bass font.
         */
        parseHTMLFiguredBass: function(str) {
            var results = this.parse(str, function(text, is_font_token) {
				if (is_font_token) {
						return '<span class="figuredbass">&nbsp; '+text+'</span>';
				} else {
						return text				
				}				
			});
            return results.join('');
        }
    };
    
    return FontParser;
});