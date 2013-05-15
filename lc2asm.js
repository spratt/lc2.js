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
			start: parseInt('3000',16),
			symbols: {},
			lines: [[]],
			line: 0,
			bytecode: []
		};

		var state = 'KEY';
		var states = {
			'KEY': function(lexeme) {
				LC2.log('in state: KEY');
				var type = lexeme.type;
				ob.lines[ob.line].push(lexeme);
				if(type !== 'DIR' && type !== 'KEY')
					state = 'ARG';
			},
			'ARG': function(lexeme) {
				LC2.log('in state: ARG');
				var type = lexeme.type;
				if(type === 'DIR' || type === 'KEY') {
					LC2.log('found new directive, incrementing line');
					++(ob.line);
					ob.lines[ob.line] = [];
					state = 'KEY';
				}
				ob.lines[ob.line].push(lexeme);
			}
		};
		lexemes.forEach(function(lexeme) {
			LC2.log('parsing lexeme ' + lexeme);
			states[state](lexeme);
		});
		ob.line = 0;
		
		return ob;
	};

	LC2.run_directives = function LC2_run_directives(ob) {
		return ob;
	};

	LC2.build_symbol_table = function LC2_build_symbol_table(ob) {
		return ob;
	};

	LC2.translate = function LC2_translate(ob) {
		var start = parseInt('3000',16);
		var symbols = ob.symbols;
		var lines  = ob.lines;

		return {start:start,bytecode:''};
	};
	
	LC2.assemble = function LC2_assemble(str) {
		var ob = LC2.parse(LC2.removeComments(LC2.tokenize(str)));
		ob = LC2.run_directives(ob);
		ob = LC2.build_symbol_table(ob);
		ob = LC2.translate(ob);
		return ob;
	};

	return LC2;
})(LC2 || {});
