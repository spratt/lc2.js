// lc2asm.js - an LC-2 assembler in Javascript
//
// Author: Simon Pratt
// License: ISC
// Website: http://spratt.github.io/lc2.js/

var LC2 = (function(LC2, undefined) {
	LC2.tokenize = function LC2_tokenize(str) {
		var lines = str.split(/[\n\f\r]+/);
		var tokenized_lines = [];
		lines.forEach(function(line) {
			var line_tokens = line.split(/[ \t]+/);
			var comment = false;
			var tokens = line_tokens.filter(function(token) {
				return token.length > 0;
			});
			if(tokens.length > 0)
				tokenized_lines.push(tokens);
		});
		return tokenized_lines;
	}

	LC2.parse = function LC2_parse(tokens) {
		return {symbols:{},tokens:tokens};
	}

	LC2.translate = function LC2_translate(ob) {
		var symbols = ob.symbols;
		var tokens  = ob.tokens;

		return {start:parseInt('3000',16),bytecode:''};
	}
	
	LC2.assemble = function LC2_assemble(str) {
		return translate(parse(tokenize(str)));
	};

	return LC2;
})(LC2 || {});