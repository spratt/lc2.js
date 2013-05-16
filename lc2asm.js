// lc2asm.js - an LC-2 assembler in Javascript
//
// Author: Simon Pratt
// License: ISC
// Website: http://spratt.github.io/lc2.js/

var LC2 = (function(LC2, undefined) {
	var hex_codes = [ 'X', '0X', '$' ];

	var startsWith = function(str, prefix) {
		return str.indexOf(prefix) === 0;
	};

	var startsWithAny = function(str, prefixes) {
		var found = false;
		prefixes.forEach(function(prefix) {
			found = found || startsWith(str, prefix);
		});
		return found;
	};

	LC2.parseNum = function(num_str) {
		var base = 10;
		LC2.log('parseNum: ' + num_str);
		num_str = num_str.toUpperCase();
		while(startsWithAny(num_str, hex_codes)) {
			base = 16;
			// this next piece of code doesn't work in general, but it works in
			// this case because the only multi-character prefix reduces to
			// another single-character prefix
			num_str = num_str.substring(1);
		}
		return parseInt(num_str, base);
	};
	
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
					regex: /^R1?[0-9]/, // register
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
		'.ORIG' : function(op, ob) {
			if(op.operands[0].type !== 'NUM')
				throw new Error('Invalid directive on line ' + op.line);
			ob.next_address = LC2.parseNum(op.operands[0].val);
		},
		'.FILL' : function(op, ob) {
			if(op.operands[0].type !== 'NUM')
				throw new Error('Invalid directive on line ' + op.line);
			if(op.symbol)
				ob.symbols[op.symbol.val] = ob.next_address;
			ob.bytecode[(ob.next_address)++] = LC2.parseNum(op.operands[0].val);
		},
		'.STRINGZ' : function(op, ob) {
			if(op.operands[0].type !== 'STR')
				throw new Error('Invalid directive on line ' + op.line);
			if(op.symbol)
				ob.symbols[op.symbol.val] = ob.next_address;
			var str = op.operands[0].val;
			for(var i = 0; i < str.length; ++i) {
				ob.bytecode[(ob.next_address)++] = str.charCodeAt(i);
			}
			ob.bytecode[(ob.next_address)++] = 0; // 0 terminated
		},
		'.BLKW' : function(op, ob) {
			if(op.operands[0].type !== 'NUM' || op.operands[1].type !== 'NUM')
				throw new Error('Invalid directive on line ' + op.line);
			if(op.symbol)
				ob.symbols[op.symbol.val] = ob.next_address;
			var size = LC2.parseNum(op.operands[0].val);
			var init = LC2.parseNum(op.operands[1].val);
			for(var i = 0; i < size; ++i)  {
				ob.bytecode[(ob.next_address)++] = init;
			}
		},
		'.END' : function() {}
	};
	var assembler_mnemonics = {
		'ADD'   : function(op, ob) {
		},
		'AND'   : function(op, ob) {
		},
		'BR'    : function(op, ob) {
		},
		'BRN'   : function(op, ob) {
		},
		'BRZ'   : function(op, ob) {
		},
		'BRP'   : function(op, ob) {
		},
		'BRNZ'  : function(op, ob) {
		},
		'BRNP'  : function(op, ob) {
		},
		'BRZP'  : function(op, ob) {
		},
		'BRNZP' : function(op, ob) {
		},
		'JSR'   : function(op, ob) {
		},
		'JMP'   : function(op, ob) {
		},
		'JSRR'  : function(op, ob) {
		},
		'JMPRR' : function(op, ob) {
		},
		'LD'    : function(op, ob) {
		},
		'LDI'   : function(op, ob) {
		},
		'LDR'   : function(op, ob) {
		},
		'LEA'   : function(op, ob) {
		},
		'NOT'   : function(op, ob) {
		},
		'RET'   : function(op, ob) {
		},
		'RTI'   : function(op, ob) {
		},
		'ST'    : function(op, ob) {
		},
		'STI'   : function(op, ob) {
		},
		'STR'   : function(op, ob) {
		},
		'TRAP'  : function(op, ob) {
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
		ob.next_address = parseInt('3000', 16);
		ob.bytecode = {};
		ob.symbols = {};

		var lines = [];
		ob.lines.forEach(function(op) {
			if(op.operator.type !== 'DIR') {
				op.address = (ob.next_address)++;
				lines.push(op);
				return;
			}
			assembler_directives[op.operator.val](op,ob);
		});
		ob.lines = lines;
		
		return ob;
	};

	LC2.build_symbol_table = function LC2_build_symbol_table(ob) {
		ob.lines.forEach(function(op) {
			if(op.symbol)
				ob.symbols[op.symbol.val] = op.address;
		});
		
		return ob;
	};

	LC2.translate = function LC2_translate(ob) {
		ob.lines.forEach(function(op) {
			op.operands.forEach(function(arg,i) {
				if(arg.type === 'KEY') {
					if(!(arg.val in ob.symbols))
						throw new Error('Undefined symbol on line ' + op.line);
					op.operands[i] = {type: 'NUM', val: ob.symbols[arg.val]};
				}
			});
			if(op.operator.type !== 'KEY')
				throw new Error('Invalid syntax on line ' + op.line);
			op.operator.val = op.operator.val.toUpperCase();
			if(!(op.operator.val in assembler_mnemonics))
				throw new Error('Invalid operator on line ' + op.line);
			assembler_mnemonics[op.operator.val](op,ob);
		});
		
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
