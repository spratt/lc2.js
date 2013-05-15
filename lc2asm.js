// lc2asm.js - an LC-2 assembler in Javascript
//
// Author: Simon Pratt
// License: ISC
// Website: http://spratt.github.io/lc2.js/

var LC2 = (function(LC2, undefined) {
	var newline_symbols    = /[\n\f\r]+/;
	var special_symbols    = /[\.\$#;]/;
	var whitespace_symbols = /[ \t]+/;
	LC2.spec = {
		states: {
			'NORMAL': [
				{
					regex: /^[,\s]+/ // whitspace
				},
				{
					regex: /^"/,  // open quote
					next_state: 'STRING'
				},
				{
					regex: /^;/,  // open comment
					next_state: 'COMMENT'
				},
				{
					regex: /^#?\$?\d+/, // literal number
					type: 'NUM'
				},
				{
					regex: /^R[0-9]{1,2}/, // register
					type: 'REG'
				},
				{
					regex: /^[a-zA-Z]\w*/, // keyword starting with a letter
					type: 'KEY'
				},
				{
					regex: /^\.[a-zA-Z]+/, // assembler directive
					type: 'DIR'
				}
			],
			'STRING': [
				{
					regex:/^"/,  // end string
					next_state: 'NORMAL'
				},
				{
					regex:/^[^"]*/, // anything else
					type: 'STR'
				}
			],
			'COMMENT': [
				{
					regex:/^\n/, // end comment
					next_state: 'NORMAL'
				},
				{
					regex:/^[^\n]*/ // anything else
				}
			]
		},
		start_state: 'NORMAL'
	};
	
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

	LC2.lex = function LC2_lex(str) {
		return lexer.lex(str, LC2.spec);
	}

	LC2.parse = function LC2_parse(lexemes) {
		var ob = {
			lines: []
		};

		var line = 0;
		var lines = [[]];
		lexemes.forEach(function(lexeme, index) {
			LC2.log('parsing lexeme of type ' + lexeme.type);
			lines[line].push(lexeme);
			if(index + 1 === lexemes.length)
				return;
			var next_lex = lexemes[index + 1];
			if(next_lex.line > lexeme.line) {
				LC2.log('found new operator, incrementing line');
				lines[++line] = [];
				state = 'OP';
			} else if(next_lex.type === 'DIR' || next_lex.type === 'KEY') {
				state = 'OP';
			} else {
				state = 'ARG';
			}
		});
		lines.forEach(function(line) {
			var op = {
				line: line[0].line,
				operator: null,
				operands: []
			};

			// remove line information
			line.forEach(function(lexeme) {
				delete lexeme.line;
			});

			// check for preceding symbol
			if(line.length > 1 && line[0].type === 'KEY' &&
			   (line[1].type === 'KEY' || line[1].type === 'DIR')) {
				op.symbol = line.shift();
			}
			op.operator = line.shift();
			while(line.length > 0)
				op.operands.push(line.shift());

			ob.lines.push(op);
		});
		
		return ob;
	};

	LC2.run_directives = function LC2_run_directives(ob) {
		return ob;
	};

	LC2.build_symbol_table = function LC2_build_symbol_table(ob) {
		ob.symbols = {};
		return ob;
	};

	LC2.translate = function LC2_translate(ob) {
		ob.bytecode = {};
		return ob;
	};
	
	LC2.assemble = function LC2_assemble(str) {
		var ob = LC2.parse(LC2.lex(str));
		ob = LC2.run_directives(ob);
		ob = LC2.build_symbol_table(ob);
		ob = LC2.translate(ob);
		return ob;
	};

	return LC2;
})(LC2 || {});
