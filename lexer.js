// lexer.js - A simple lexer in javascript
//
// Author: Simon Pratt
// License: ISC
// Website: http://spratt.github.io/lc2.js/

var lexer = (function(lexer, undefined) {
	lexer.debug = false;
	lexer.log = function(o) { if(lexer.debug) console.log(o); };
	lexer.dir = function(o) { if(lexer.debug) console.dir(o); };
	
	lexer.lex = function(str,spec) {
		var tokens = [];
		var start = 0;
		var state = spec.start_state;

		lexer.log('len: ' + str.length);
		while(start < str.length) {
			lexer.log('start: ' + start);
			var matched = false;
			var patterns = spec.states[state];
			for(var i = 0; i < patterns.length; ++i) {
				var pattern = patterns[i];
				var matches = pattern.regex.exec(str.substring(start));
				lexer.dir(matches);
				if(matches) {
					var match = matches[0];
					if('type' in pattern) {
						tokens.push({
							type: pattern.type,
							val: match
						});
					}
					if('next_state' in pattern) {
						state = pattern.next_state;
					}
					matched = true;
					start += match.length;
					break;
				}
			}
			if(!matched)
				throw new Error("No pattern matched on character " + start);
			lexer.log('end: ' + start);
			lexer.log('state: ' + state);
		}

		return tokens;
	};

	return lexer;
})(lexer || {});
