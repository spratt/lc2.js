// lc2asm.js - an LC-2 assembler in Javascript
//
// Author: Simon Pratt
// License: ISC
// Website: http://spratt.github.io/lc2.js/

// startsWith polyfill
if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: function (searchString, position) {
            position = position || 0;
             return this.indexOf(searchString, position) === position;
        }
    });
}

Object.defineProperty(String.prototype, 'startsWithAny', {
    enumerable: false,
    configurable: false,
    writable: false,
	value: function(searchStrings, position) {
		var str = this;
		var found = false;
		LC2.log(str + '.swa([' + searchStrings + '],' + position + ')');
		searchStrings.forEach(function(searchString) {
			if(str.startsWith(searchString,position))
				found = true;
		});
		return found;
	}
});

var LC2 = (function(LC2, undefined) {
	var newline_symbols    = /[\n\f\r]+/;
	var special_symbols    = /[\.\$#;]/;
	var whitespace_symbols = /[ \t]+/;
	var hex_flags = ['$','x','X','0x'];

	function myParseInt(int_str) {
		LC2.log('mpi called with ' + int_str);
		var base = 10;
		while(int_str.startsWithAny(hex_flags)) {
			LC2.log('starts with a hex flag');
			base = 16;
			int_str = int_str.substring(1);
		}
		LC2.log('now parsing ' + int_str);
		var val = parseInt(int_str,base);
		LC2.log('parsed as ' + val);
		return val;
	}
	
	var assembler_directives = {
		'.ORIG'    : function(line, ob) {
			ob.start = myParseInt(line[1]);
		},
		'.FILL'    : function(line, ob) {
			ob.bytecode[ob.line] = myParseInt(line[1]);
		},
		'.STRINGZ' : function(line, ob) {
			var str = '';
			for(var i = 1; i < line.length; ++i) {
				str += line[i];
			}
			str.substr(1,str.length-2); // remove quotes
			for(var i = 0; i < str.length; ++i) {
				ob.bytecode[(ob.line)++] = str.charCodeAt(i);
			}
		},
		'.BLKW'    : function(line, ob) {
			var size = myParseInt(line[1]);
			var init = myParseInt(line[2]);
			for(var i = 0; i < size; ++i)  {
				ob.bytecode[(ob.line)++] = init;
			}
		}
	};
	var assembler_mnemonics = {
		'ADD'   : function(line, ob) {
		},
		'AND'   : function(line, ob) {
		},
		'BR'    : function(line, ob) {
		},
		'BRN'   : function(line, ob) {
		},
		'BRZ'   : function(line, ob) {
		},
		'BRP'   : function(line, ob) {
		},
		'BRNZ'  : function(line, ob) {
		},
		'BRNP'  : function(line, ob) {
		},
		'BRZP'  : function(line, ob) {
		},
		'BRNZP' : function(line, ob) {
		},
		'JSR'   : function(line, ob) {
		},
		'JMP'   : function(line, ob) {
		},
		'JSRR'  : function(line, ob) {
		},
		'JMPRR' : function(line, ob) {
		},
		'LD'    : function(line, ob) {
		},
		'LDI'   : function(line, ob) {
		},
		'LDR'   : function(line, ob) {
		},
		'LEA'   : function(line, ob) {
		},
		'NOT'   : function(line, ob) {
		},
		'RET'   : function(line, ob) {
		},
		'RTI'   : function(line, ob) {
		},
		'ST'    : function(line, ob) {
		},
		'STI'   : function(line, ob) {
		},
		'STR'   : function(line, ob) {
		},
		'TRAP'  : function(line, ob) {
		}
	};
	
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
		var ob = {
			start: parseInt('3000',16),
			symbols: {},
			lines: lines,
			line: 0,
			bytecode: {}
		};

		lines = [];
		ob.lines.forEach(function(line) {
			var first = line[0].toUpperCase();
			if(first in assembler_directives) {
				assembler_directives[(first)](line, ob);
			} else if(first in assembler_mnemonics) {
				lines.push(line);
				++(ob.line);
			} else {
				// must be a new label
				ob.symbols[line.shift()] = ob.start + ob.line;
				first = line[0].toUpperCase();
				if(first in assembler_mnemonics) {
					lines.push(line);
					++(ob.line);
				} else {
					throw new Error('Parse Error on line ' + (ob.line + 1));
				}
			}
		});
		ob.lines = lines;
		
		return ob;
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
