// tokenizer.js - A simple tokenizer in javascript
//
// Author: Simon Pratt
// License: ISC
// Website: http://spratt.github.io/lc2.js/

var tokenizer = (function(tokenizer, undefined) {
	tokenizer.tokenize = function(str,spec) {
		var tokens = [];
		var start = 0;

		while(start < str.length) {
			start += spec.states[spec.state](str.substring(start), tokens);
		}

		return tokens;
	};

	return tokenizer;
})(tokenizer || {});