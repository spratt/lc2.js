// lc2asm.js - an LC-2 assembler in Javascript
//
// Author: Simon Pratt
// License: ISC
// Website: http://blog.pr4tt.com/lc2.js/

var LC2 = (function(LC2, undefined) {
    LC2.log = function(o) { if(LC2.debug) console.log(o); };

    var DEFAULT_ADDRESS = parseInt('3000', 16);
    
    var number_types = {
        'BIN': 2,
        'HEX': 16,
        'DEC': 10
    };

    function hex(n) { return (n >> 0).toString(16); }

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
                    regex: /^[%bB](-?[01]+)/,
                    type: 'BIN'
                },
                {
                    regex: /^(?:\$|x|X|0x|0X)(-?[\da-fA-F]+)/,
                    type: 'HEX'
                },
                {
                    regex: /^#?(-?\d+)/,
                    type: 'DEC'
                },
                {
                    regex: /^[Rr](1?[0-9])/, // register
                    type: 'REG'
                },
                {
                    regex: /^([a-zA-Z]\w*):/, // symbol
                    type: 'SYM'
                },
                {
                    regex: /^[a-zA-Z]\w*/, // keyword (instruction or symbol)
                    type: 'KEY'
                },
                {
                    regex: /^\.([a-zA-Z]+)/, // assembler directive
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
        'ORIG' : function(op, ob) { // set next memory location
            if(!(op.operands[0].type === 'NUM'))
                throw new Error('First argument should be a number' +
                                ' on line ' + op.line);
            try {
                ob.next_address = op.operands[0].val;
            } catch(err) {
                throw new Error('Invalid number on line ' +    op.line);
            }
        },
        'FILL' : function(op, ob) { // fill a specific location in memory
            if(!(op.operands[0].type === 'NUM'))
                throw new Error('First argument should be a number' +
                                ' on line ' + op.line);
            if(op.symbol)
                ob.symbols[op.symbol] = ob.next_address;
            try {
                ob.bytecode[hex((ob.next_address)++)] = op.operands[0].val;
            } catch(err) {
                throw new Error('Invalid number on line ' +    op.line);
            }
        },
        'STRINGZ' : function(op, ob) { // write a string to memory
            if(op.operands[0].type !== 'STR')
                throw new Error('First argument should be a string' +
                                ' on line ' + op.line);
            if(op.symbol)
                ob.symbols[op.symbol] = ob.next_address;
            var str = op.operands[0].val;
            for(var i = 0; i < str.length; ++i) {
                ob.bytecode[hex((ob.next_address)++)] = str.charCodeAt(i);
            }
            ob.bytecode[hex((ob.next_address)++)] = 0; // 0 terminated
        },
        'BLKW' : function(op, ob) { // fill several locations in memory
            if(!(op.operands[0].type === 'NUM'))
                throw new Error('First argument should be a number' +
                                ' on line ' + op.line);
            if(!(op.operands[1].type === 'NUM'))
                throw new Error('Second argument should be a number' +
                                ' on line ' + op.line);
            if(op.symbol)
                ob.symbols[op.symbol] = ob.next_address;
            var size = op.operands[0].val;
            var init = op.operands[1].val;
            for(var i = 0; i < size; ++i)  {
                ob.bytecode[hex((ob.next_address)++)] = init;
            }
        },
        'END' : function() {} // mark end of program
    };
    var assembler_mnemonics = {
        'ADD'   : function(op, ob) {
            if(op.operands[0].type !== 'REG')
                throw new Error('Arg 1 to ADD on line ' + op.line +
                                ' should be a register');
            if(op.operands[1].type !== 'REG')
                throw new Error('Arg 2 to ADD on line ' + op.line +
                                ' should be a register');
            if(op.operands[2].type !== 'REG' &&
               !(op.operands[2].type === 'NUM'))
                throw new Error('Arg 3 to ADD on line ' + op.line +
                                ' should be a register or number');
            var dest_reg = op.operands[0].val;
            var src1_reg = op.operands[1].val;
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('0001',2) << 12;
            ob.bytecode[op.address] += dest_reg << 9;
            ob.bytecode[op.address] += src1_reg << 6;
            if(op.operands[2].type === 'REG') {
                var src2_reg = op.operands[2].val;
                ob.bytecode[op.address] += src2_reg;
            } else {
                ob.bytecode[op.address] += 1 << 5;
                var imm5_val = op.operands[2].val & LC2.ones(5);
                ob.bytecode[op.address] += imm5_val;
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
            if(op.operands[2].type !== 'REG' &&
               !(op.operands[2].type === 'NUM'))
                throw new Error('Arg 3 to AND on line ' + op.line +
                                ' should be a register or number');
            var dest_reg = op.operands[0].val;
            var src1_reg = op.operands[1].val;
            LC2.log('dest: ' + dest_reg);
            LC2.log('src1: ' + src1_reg);
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('0101',2) << 12;
            ob.bytecode[op.address] += dest_reg << 9;
            ob.bytecode[op.address] += src1_reg << 6;
            if(op.operands[2].type === 'REG') {
                var src2_reg = op.operands[2].val;
                LC2.log('src2: ' + src2_reg);
                ob.bytecode[op.address] += src2_reg;
            } else {
                ob.bytecode[op.address] += 1 << 5;
                var imm5_val = op.operands[2].val & LC2.ones(5);
                LC2.log('imm5: ' + imm5_val);
                ob.bytecode[op.address] += imm5_val;
            }
        },
        'NOP'   : function(op, ob) {
            ob.bytecode[op.address] = 0;
        },
        'BR'    : function(op, ob) {
            // this is really just a nop
            ob.bytecode[op.address] = 0;
        },
        'BRN'   : function(op, ob) {
            if(!(op.operands[0].type === 'NUM'))
                throw new Error('Arg 1 to BRn on line ' + op.line +
                                ' should be a number');
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('100', 2) << 9;
            ob.bytecode[op.address] += op.operands[0].val & LC2.ones(9);
        },
        'BRZ'   : function(op, ob) {
            if(!(op.operands[0].type === 'NUM'))
                throw new Error('Arg 1 to BRz on line ' + op.line +
                                ' should be a number');
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('010', 2) << 9;
            ob.bytecode[op.address] += op.operands[0].val & LC2.ones(9);
        },
        'BRP'   : function(op, ob) {
            if(!(op.operands[0].type === 'NUM'))
                throw new Error('Arg 1 to BRp on line ' + op.line +
                                ' should be a number');
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('001', 2) << 9;
            ob.bytecode[op.address] += op.operands[0].val & LC2.ones(9);
        },
        'BRNZ'  : function(op, ob) {
            if(!(op.operands[0].type === 'NUM'))
                throw new Error('Arg 1 to BRnz on line ' + op.line +
                                ' should be a number');
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('110', 2) << 9;
            ob.bytecode[op.address] += op.operands[0].val & LC2.ones(9);
        },
        'BRNP'  : function(op, ob) {
            if(!(op.operands[0].type === 'NUM'))
                throw new Error('Arg 1 to BRnp on line ' + op.line +
                                ' should be a number');
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('101', 2) << 9;
            ob.bytecode[op.address] += op.operands[0].val & LC2.ones(9);
        },
        'BRZP'  : function(op, ob) {
            if(!(op.operands[0].type === 'NUM'))
                throw new Error('Arg 1 to BRzp on line ' + op.line +
                                ' should be a number');
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('011', 2) << 9;
            ob.bytecode[op.address] += op.operands[0].val & LC2.ones(9);
        },
        'BRNZP' : function(op, ob) {
            if(!(op.operands[0].type === 'NUM'))
                throw new Error('Arg 1 to BRnzp on line ' + op.line +
                                ' should be a number');
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('111', 2) << 9;
            ob.bytecode[op.address] += op.operands[0].val & LC2.ones(9);
        },
        'JMP'   : function(op, ob) { // JSR with L = 0
            if(!(op.operands[0].type === 'NUM'))
                throw new Error('Arg 1 to JMP on line ' + op.line +
                                ' should be a number');
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('0100', 2) << 12;
            ob.bytecode[op.address] += op.operands[0].val & LC2.ones(9);
        },
        'JMPR' : function(op, ob) { // JSRR with L = 0
            if(op.operands[0].type !== 'REG')
                throw new Error('Arg 1 to JMPR on line ' + op.line +
                                ' should be a register');
            if(!(op.operands[1].type === 'NUM'))
                throw new Error('Arg 2 to JMPR on line ' + op.line +
                                ' should be a number');
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('1100', 2) << 12;
            ob.bytecode[op.address] += op.operands[0].val << 6;
            ob.bytecode[op.address] += op.operands[1].val & LC2.ones(6);
        },
        'JSR'   : function(op, ob) {
            if(!(op.operands[0].type === 'NUM'))
                throw new Error('Arg 1 to JSR on line ' + op.line +
                                ' should be a number');
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('0100', 2) << 12;
            ob.bytecode[op.address] += 1 << 11;
            ob.bytecode[op.address] += op.operands[0].val & LC2.ones(9);
        },
        'JSRR'  : function(op, ob) {
            if(op.operands[0].type !== 'REG')
                throw new Error('Arg 1 to JSRR on line ' + op.line +
                                ' should be a register');
            if(!(op.operands[1].type === 'NUM'))
                throw new Error('Arg 2 to JSRR on line ' + op.line +
                                ' should be a number');
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('1100', 2) << 12;
            ob.bytecode[op.address] += 1 << 11;
            var dest_reg = op.operands[0].val
            ob.bytecode[op.address] += dest_reg << 6;
            ob.bytecode[op.address] += op.operands[1].val & LC2.ones(6);
        },
        'LD'    : function(op, ob) {
            if(op.operands[0].type !== 'REG')
                throw new Error('Arg 1 to LD on line ' + op.line +
                                ' should be a register');
            if(!(op.operands[1].type === 'NUM'))
                throw new Error('Arg 2 to LD on line ' + op.line +
                                ' should be a number');
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('0010', 2) << 12;
            var dest_reg = op.operands[0].val;
            ob.bytecode[op.address] += dest_reg << 9;
            ob.bytecode[op.address] += (op.operands[1].val & LC2.ones(9));
        },
        'LDI'   : function(op, ob) {
            if(op.operands[0].type !== 'REG')
                throw new Error('Arg 1 to LDI on line ' + op.line +
                                ' should be a register');
            if(!(op.operands[1].type === 'NUM'))
                throw new Error('Arg 2 to LDI on line ' + op.line +
                                ' should be a number');
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('1010', 2) << 12;
            var dest_reg = op.operands[0].val;
            ob.bytecode[op.address] += dest_reg << 9;
            ob.bytecode[op.address] += (op.operands[1].val & LC2.ones(9));
        },
        'LDR'   : function(op, ob) {
            if(op.operands[0].type !== 'REG')
                throw new Error('Arg 1 to LDR on line ' + op.line +
                                ' should be a register');
            if(op.operands[1].type !== 'REG')
                throw new Error('Arg 2 to LDR on line ' + op.line +
                                ' should be a register');
            if(!(op.operands[2].type === 'NUM'))
                throw new Error('Arg 3 to LDR on line ' + op.line +
                                ' should be a number');
            var dest_reg = op.operands[0].val;
            var base_reg = op.operands[1].val;
            var ind6_val = op.operands[2].val & LC2.ones(6);
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('0110',2) << 12;
            ob.bytecode[op.address] += dest_reg << 9;
            ob.bytecode[op.address] += base_reg << 6;
            ob.bytecode[op.address] += ind6_val;
        },
        'LEA'   : function(op, ob) {
            if(op.operands[0].type !== 'REG')
                throw new Error('Arg 1 to LEA on line ' + op.line +
                                ' should be a register');
            if(!(op.operands[1].type === 'NUM'))
                throw new Error('Arg 2 to LEA on line ' + op.line +
                                ' should be a number');
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('1110', 2) << 12;
            var dest_reg = op.operands[0].val;
            ob.bytecode[op.address] += dest_reg << 9;
            ob.bytecode[op.address] += (op.operands[1].val & LC2.ones(9));
        },
        'NOT'   : function(op, ob) {
            if(op.operands[0].type !== 'REG')
                throw new Error('Arg 1 to ADD on line ' + op.line +
                                ' should be a register');
            if(op.operands[1].type !== 'REG')
                throw new Error('Arg 2 to ADD on line ' + op.line +
                                ' should be a register');
            var dest_reg = op.operands[0].val;
            var src1_reg = op.operands[1].val;
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('1001',2) << 12;
            ob.bytecode[op.address] += dest_reg << 9;
            ob.bytecode[op.address] += src1_reg << 6;
            ob.bytecode[op.address] += LC2.ones(6);
        },
        'RET'   : function(op, ob) {
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('1101', 2) << 12;
        },
        'RTI'   : function(op, ob) {
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('1000', 2) << 12;
        },
        'ST'    : function(op, ob) {
            if(op.operands[0].type !== 'REG')
                throw new Error('Arg 1 to ST on line ' + op.line +
                                ' should be a register');
            if(!(op.operands[1].type === 'NUM'))
                throw new Error('Arg 2 to ST on line ' + op.line +
                                ' should be a number');
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('0011', 2) << 12;
            var src1_reg = op.operands[0].val;
            ob.bytecode[op.address] += src1_reg << 9;
            ob.bytecode[op.address] += (op.operands[1].val & LC2.ones(9));
        },
        'STI'   : function(op, ob) {
            if(op.operands[0].type !== 'REG')
                throw new Error('Arg 1 to STI on line ' + op.line +
                                ' should be a register');
            if(!(op.operands[1].type === 'NUM'))
                throw new Error('Arg 2 to STI on line ' + op.line +
                                ' should be a number');
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('1011', 2) << 12;
            var src1_reg = op.operands[0].val;
            ob.bytecode[op.address] += src1_reg << 9;
            ob.bytecode[op.address] += (op.operands[1].val & LC2.ones(9));
        },
        'STR'   : function(op, ob) {
            if(op.operands[0].type !== 'REG')
                throw new Error('Arg 1 to STR on line ' + op.line +
                                ' should be a register');
            if(op.operands[1].type !== 'REG')
                throw new Error('Arg 2 to STR on line ' + op.line +
                                ' should be a register');
            if(!(op.operands[2].type === 'NUM'))
                throw new Error('Arg 3 to STR on line ' + op.line +
                                ' should be a number');
            var src1_reg = op.operands[0].val;
            var base_reg = op.operands[1].val;
            var ind6_val = op.operands[2].val & LC2.ones(6);
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('0111',2) << 12;
            ob.bytecode[op.address] += src1_reg << 9;
            ob.bytecode[op.address] += base_reg << 6;
            ob.bytecode[op.address] += ind6_val;
        },
        'TRAP'  : function(op, ob) {
            if(!(op.operands[0].type === 'NUM'))
                throw new Error('Arg 1 to TRAP on line ' + op.line +
                                ' should be a number');
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('1111', 2) << 12;
            ob.bytecode[op.address] += op.operands[0].val & LC2.ones(8);
        },
        'GETC' : function(op, ob) {
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('1111', 2) << 12;
            ob.bytecode[op.address] += parseInt('20', 16);
        },
        'OUT' : function(op, ob) {
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('1111', 2) << 12;
            ob.bytecode[op.address] += parseInt('21', 16);
        },
        'PUTS' : function(op, ob) {
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('1111', 2) << 12;
            ob.bytecode[op.address] += parseInt('22', 16);
        },
        'IN' : function(op, ob) {
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('1111', 2) << 12;
            ob.bytecode[op.address] += parseInt('23', 16);
        },
        'HALT' : function(op, ob) {
            ob.bytecode[op.address] = 0;
            ob.bytecode[op.address] += parseInt('1111', 2) << 12;
            ob.bytecode[op.address] += parseInt('25', 16);
        }
    };

    LC2.lex = function LC2_lex(str) {
        var lexemes = lexer.lex(str, LC2.spec);
        lexemes.forEach(function(lexeme, index) {
            if(lexeme.type !== 'STR')
                lexeme.val = lexeme.val.toUpperCase();
            if(lexeme.type === 'KEY') {
                if(lexeme.val in assembler_mnemonics)
                    lexeme.type = 'OPR';
                else
                    lexeme.type = 'REF';
            }
        });
        return lexemes;
    }

    LC2.parse = function LC2_parse(lexemes) {
        var ob = {
            lines: []
        };

        var line = 0;
        var lines = [[]];
        lexemes.forEach(function(lexeme, index) {
            LC2.log('parsing lexeme of type ' + lexeme.type);
            // clean up some lexemes
            if(lexeme.type === 'REG') {
                var val = parseInt(lexeme.val, 10) & LC2.ones(3);
                lexeme.val = val;
            } else if(lexeme.type in number_types) {
                try {
                    lexeme.val = parseInt(lexeme.val, number_types[lexeme.type]);
                } catch(err) {
                    throw new Error('Invalid number on line ' + lexeme.line);
                }
                lexeme.type = 'NUM';
            }
            lines[line].push(lexeme);
            if(index + 1 === lexemes.length)
                return;
            var next_lex = lexemes[index + 1];
            if(next_lex.line > lexeme.line) {
                LC2.log('found new operator, incrementing line');
                lines[++line] = [];
                state = 'OP';
            } else if(next_lex.type === 'DIR' || next_lex.type === 'OPR') {
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
            if(line[0].type === 'SYM') {
                var symbol = line.shift().val;
                op.symbol = symbol;
            }
            op.operator = line.shift();
            while(line.length > 0)
                op.operands.push(line.shift());

            ob.lines.push(op);
        });

        return ob;
    };

    LC2.run_directives = function LC2_run_directives(ob) {
        ob.next_address = DEFAULT_ADDRESS;
        ob.bytecode = {};
        ob.symbols = {};

        var lines = [];
        ob.lines.forEach(function(op) {
            if(op.operator.type !== 'DIR') {
                op.address = hex((ob.next_address)++);
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
                ob.symbols[op.symbol] = parseInt(op.address, 16);
            delete op.symbol;
        });

        return ob;
    };

    function LC2Error(msg, lineNum) {
        this.message = msg;
        this.line = lineNum;
    }

    LC2.translate = function LC2_translate(ob) {
        ob.lines.forEach(function(op) {
            if(!(op.operator.val in assembler_mnemonics)) {
                throw new LC2Error('Invalid operator "' + op.operator.val + '"',
                                   op.line);
            }
            if(op.operator.type !== 'OPR')
                throw new LC2Error('Invalid syntax', op.line);
            // replace symbolic operands with memory locations
            op.operands.forEach(function(arg,i) {
                if(arg.type === 'REF') {
                    if(!(arg.val in ob.symbols)) {
                        console.dir(ob);
                        throw new Error('Undefined symbol "' +
                                        arg.val + '" on line ' + op.line);
                    }
                    op.operands[i] = {type: 'NUM', val: ob.symbols[arg.val]};
                }
            });
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
