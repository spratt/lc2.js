// lc2asm.js - an LC-2 assembler in Javascript
//
// Author: Simon Pratt
// License: ISC
// Website: http://spratt.github.io/lc2.js/

var LC2 = (function(LC2, undefined) {
	function tokenize(str) {
		return [];
	}

	function parse(tokens) {
		return {symbols:{},tokens:tokens};
	}

	function translate(ob) {
		var symbols = ob.symbols;
		var tokens  = ob.tokens;

		return '';
	}
	
	LC2.assemble = function(str) {
		return translate(parse(tokenize(str)));
	};
})(LC2 | {});