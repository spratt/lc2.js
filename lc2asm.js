// lc2asm.js - an LC-2 assembler in Javascript
//
// Author: Simon Pratt
// License: ISC
// Website: http://spratt.github.io/lc2.js/

var LC2 = (function(LC2, undefined) {

	// copied from lc2.js - TODO: remove this duplication
	var toSignedInt = function(n, bits) {
		var shift = 32 - bits;
		return (n << shift) >> shift;
	};

	LC2.parseNum = function(num_str) {
		var hex = /^(?:\$|x|X|0x|0X)([\da-fA-F]+)/.exec(num_str);
		var bin = /^(?:%|b|B)(\d+)/.exec(num_str);
		var dec = /^#(\d+)/.exec(num_str);
		if(hex && hex[1]) return parseInt(hex[1], 16);
		if(bin && bin[1]) return parseInt(bin[1], 2);
		if(dec && dec[1]) return parseInt(dec[1], 10);
		throw new Error('Invalid number specification');
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
					regex: /^(?:\$|x|X|0x|0X|%|b|B|#)[\da-fA-F]+/, // literal number
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
			try {
				ob.next_address = LC2.parseNum(op.operands[0].val);
			} catch(err) {
				throw new Error('Invalid number on line ' +	op.line);
			}
		},
		'.FILL' : function(op, ob) {
			if(op.operands[0].type !== 'NUM')
				throw new Error('Invalid directive on line ' + op.line);
			if(op.symbol)
				ob.symbols[op.symbol.val] = ob.next_address;
			try {
				ob.bytecode[(ob.next_address)++] =
					LC2.parseNum(op.operands[0].val);
			} catch(err) {
				throw new Error('Invalid number on line ' +	op.line);
			}
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
			try {
				var size = LC2.parseNum(op.operands[0].val);
				var init = LC2.parseNum(op.operands[1].val);
			} catch(err) {
				throw new Error('Invalid number on line ' + op.line);
			}
			for(var i = 0; i < size; ++i)  {
				ob.bytecode[(ob.next_address)++] = init;
			}
		},
		'.END' : function() {}
	};
	var assembler_mnemonics = {
		'ADD'   : function(op, ob) {
			if(op.operands[0].type !== 'REG')
				throw new Error('Arg 1 to ADD on line ' + op.line +
								' should be a register');
			if(op.operands[1].type !== 'REG')
				throw new Error('Arg 2 to ADD on line ' + op.line +
								' should be a register');
			if(op.operands[2].type !== 'REG' && op.operands[2].type !== 'NUM')
				throw new Error('Arg 3 to ADD on line ' + op.line +
								' should be a register or number');
			var dest_reg = parseInt(op.operands[0].val.substring(1), 10);
			var src1_reg = parseInt(op.operands[1].val.substring(1), 10);
			ob.bytecode[op.address] = 0;
			ob.bytecode[op.address] += parseInt('0001',2) << 12;
			ob.bytecode[op.address] += dest_reg << 9;
			ob.bytecode[op.address] += src1_reg << 6;
			if(op.operands[2].type === 'REG') {
				var src2_reg = parseInt(op.operands[2].val.substring(1), 10);
				ob.bytecode[op.address] += src2_reg;
			} else {
				ob.bytecode[op.address] += 1 << 5;
				try {
					ob.bytecode[op.address] += LC2.parseNum(op.operands[2].val);
				} catch(err) {
					throw new Error('Invalid number on line ' +	op.line);
				}
			}
		},
		'AND'   : function(op, ob) {
			LC2.log('building AND bytecode');
			if(op.operands[0].type !== 'REG')
				throw new Error('Arg 1 to AND on line ' + op.line +
								' should be a register');
			if(op.operands[1].type !== 'REG')
				throw new Error('Arg 2 to AND on line ' + op.line +
								' should be a register');
			if(op.operands[2].type !== 'REG' && op.operands[2].type !== 'NUM')
				throw new Error('Arg 3 to AND on line ' + op.line +
								' should be a register or number');
			var dest_reg = parseInt(op.operands[0].val.substring(1), 10);
			var src1_reg = parseInt(op.operands[1].val.substring(1), 10);
			LC2.log('dest: ' + dest_reg);
			LC2.log('src1: ' + src1_reg);
			ob.bytecode[op.address] = 0;
			ob.bytecode[op.address] += parseInt('0101',2) << 12;
			ob.bytecode[op.address] += dest_reg << 9;
			ob.bytecode[op.address] += src1_reg << 6;
			if(op.operands[2].type === 'REG') {
				var src2_reg = parseInt(op.operands[2].val.substring(1), 10);
				LC2.log('src2: ' + src2_reg);
				ob.bytecode[op.address] += src2_reg;
			} else {
				try {
					var imm5_val = LC2.parseNum(op.operands[2].val);
				} catch(err) {
					throw new Error('Invalid number on line ' + op.line);
				}
				LC2.log('imm5: ' + imm5_val);
				ob.bytecode[op.address] += 1 << 5;
				ob.bytecode[op.address] += imm5_val;
			}
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
		delete ob.next_address;
		
		return ob;
	};

	LC2.build_symbol_table = function LC2_build_symbol_table(ob) {
		ob.lines.forEach(function(op) {
			if(op.symbol)
				ob.symbols[op.symbol.val] = op.address;
			delete op.symbol;
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
		
		return ob.bytecode;
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
