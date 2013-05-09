// lc2asm.js - an LC-2 assembler in Javascript
//
// Author: Simon Pratt
// License: ISC
// Website: http://spratt.github.io/lc2.js/

var LC2 = (function(LC2, undefined) {
	var newline_symbols    = /[\n\f\r]+/;
	var special_symbols    = /[\.\$#;]/;
	var whitespace_symbols = /[ \t]+/;
	
	LC2.tokenize = function LC2_tokenize(str) {
		var lines = str.split(newline_symbols);
		var tokenized_lines = [];
		lines.forEach(function(line) {
			var tokens = line
				.split(whitespace_symbols)
				.filter(function(token) {
					return token.length > 0;
				});
			if(tokens.length < 1) return;
			tokenized_lines.push(tokens);
		});
		return tokenized_lines;
	};

	LC2.removeComments = function LC2_removeComments(lines) {
		var tokens = [];
		var line_tokens = [];
		lines.forEach(function(line) {
			for(var i = 0; i < line.length; ++i) {
				var token = line[i];
				if(token[0] === ';') {
					break;
				}
				line_tokens.push(token);
			}
			if(line_tokens.length === 0)
				return;
			tokens.push(line_tokens);
			line_tokens = [];
		});
		return tokens;
	};

	LC2.parse = function LC2_parse(lines) {
		var symbols = {};

		
		
		return {symbols:symbols,lines:lines};
	};

	LC2.translate = function LC2_translate(ob) {
		var start = parseInt('3000',16);
		var symbols = ob.symbols;
		var lines  = ob.lines;

		return {start:start,bytecode:''};
	};
	
	LC2.assemble = function LC2_assemble(str) {
		var tokens = LC2.removeComments(LC2.tokenize(str));
		return LC2.translate(LC2.parse(tokens));
	};

	return LC2;
})(LC2 || {});