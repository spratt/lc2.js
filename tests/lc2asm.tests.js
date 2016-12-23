module('lc2asm.js');

test("test lexing actual program", function() {
    var str = "";
    str += "; myprog.asm\n";
    str += ".ORIG $4000\n";
    str += "ZERO: AND R0, R0, #0 ;zero out R0\n";
    str += 'HELLO: .STRINGZ "Hello, world!" ; never used\n';
    str += ".END\n";
    var expected_tokens = [
        {type: 'DIR', line: 2, val: 'ORIG'},
        {type: 'HEX', line: 2, val: '4000'},
        {type: 'SYM', line: 3, val: 'ZERO'},
        {type: 'OPR', line: 3, val: 'AND'},
        {type: 'REG', line: 3, val: '0'},
        {type: 'REG', line: 3, val: '0'},
        {type: 'DEC', line: 3, val: '0'},
        {type: 'SYM', line: 4, val: 'HELLO'},
        {type: 'DIR', line: 4, val: 'STRINGZ'},
        {type: 'STR', line: 4, val: 'Hello, world!'},
        {type: 'DIR', line: 5, val: 'END'}
    ];
    deepEqual(LC2.lex(str), expected_tokens);
});

test("test lexing different registers", function() {
    var str = "";
    str += ".ORIG $4000\n";
    str += "ADD R0, R1, #0\n";
    str += "ADD R2, R3, #0\n";
    str += "ADD R4, R5, #0\n";
    str += "ADD R6, R7, #0\n";
    str += ".END\n";
    var expected_tokens = [
        {type: 'DIR', line: 1, val: 'ORIG'},
        {type: 'HEX', line: 1, val: '4000'},
        {type: 'OPR', line: 2, val: 'ADD'},
        {type: 'REG', line: 2, val: '0'},
        {type: 'REG', line: 2, val: '1'},
        {type: 'DEC', line: 2, val: '0'},
        {type: 'OPR', line: 3, val: 'ADD'},
        {type: 'REG', line: 3, val: '2'},
        {type: 'REG', line: 3, val: '3'},
        {type: 'DEC', line: 3, val: '0'},
        {type: 'OPR', line: 4, val: 'ADD'},
        {type: 'REG', line: 4, val: '4'},
        {type: 'REG', line: 4, val: '5'},
        {type: 'DEC', line: 4, val: '0'},
        {type: 'OPR', line: 5, val: 'ADD'},
        {type: 'REG', line: 5, val: '6'},
        {type: 'REG', line: 5, val: '7'},
        {type: 'DEC', line: 5, val: '0'},
        {type: 'DIR', line: 6, val: 'END'}
    ];
    deepEqual(LC2.lex(str), expected_tokens);
});

test("test parsing actual program", function() {
    var input_tokens = [
        {type: 'DIR', line: 2, val: 'ORIG'},
        {type: 'HEX', line: 2, val: '4000'},
        {type: 'SYM', line: 3, val: 'ZERO'},
        {type: 'OPR', line: 3, val: 'AND'},
        {type: 'REG', line: 3, val: '0'},
        {type: 'REG', line: 3, val: '0'},
        {type: 'DEC', line: 3, val: '0'},
        {type: 'SYM', line: 4, val: 'HELLO'},
        {type: 'DIR', line: 4, val: 'STRINGZ'},
        {type: 'STR', line: 4, val: 'Hello, world!'},
        {type: 'DIR', line: 5, val: 'END'}
    ];
    var expected_ob = {
        lines: [
            {
                line: 2,
                operator: {type: 'DIR', val: 'ORIG'},
                operands: [
                    {type: 'NUM', val: parseInt('4000', 16)}
                ]
            },{
                line: 3,
                symbol: 'ZERO',
                operator: {type: 'OPR', val: 'AND'},
                operands: [
                    {type: 'REG', val: 0},
                    {type: 'REG', val: 0},
                    {type: 'NUM', val: 0}
                ]
            },{
                line: 4,
                symbol: 'HELLO',
                operator: {type: 'DIR', val: 'STRINGZ'},
                operands: [
                    {type: 'STR', val: 'Hello, world!'}
                ]
            },{
                line: 5,
                operator: {type: 'DIR', val: 'END'},
                operands: []
            }
        ]
    };
    deepEqual(LC2.parse(input_tokens), expected_ob);
});

test("test parsing different registers", function() {
    var input_tokens = [
        {type: 'DIR', line: 1, val: 'ORIG'},
        {type: 'HEX', line: 1, val: '4000'},
        {type: 'OPR', line: 2, val: 'ADD'},
        {type: 'REG', line: 2, val: '0'},
        {type: 'REG', line: 2, val: '1'},
        {type: 'DEC', line: 2, val: '0'},
        {type: 'OPR', line: 3, val: 'ADD'},
        {type: 'REG', line: 3, val: '2'},
        {type: 'REG', line: 3, val: '3'},
        {type: 'DEC', line: 3, val: '0'},
        {type: 'OPR', line: 4, val: 'ADD'},
        {type: 'REG', line: 4, val: '4'},
        {type: 'REG', line: 4, val: '5'},
        {type: 'DEC', line: 4, val: '0'},
        {type: 'OPR', line: 5, val: 'ADD'},
        {type: 'REG', line: 5, val: '6'},
        {type: 'REG', line: 5, val: '7'},
        {type: 'DEC', line: 5, val: '0'},
        {type: 'DIR', line: 6, val: 'END'}
    ];
    var expected_ob = {
        lines: [
            {
                line: 1,
                operator: {type: 'DIR', val: 'ORIG'},
                operands: [
                    {type: 'NUM', val: parseInt('4000', 16)}
                ]
            },{
                line: 2,
                operator: {type: 'OPR', val: 'ADD'},
                operands: [
                    {type: 'REG', val: 0},
                    {type: 'REG', val: 1},
                    {type: 'NUM', val: 0}
                ]
            },{
                line: 3,
                operator: {type: 'OPR', val: 'ADD'},
                operands: [
                    {type: 'REG', val: 2},
                    {type: 'REG', val: 3},
                    {type: 'NUM', val: 0}
                ]
            },{
                line: 4,
                operator: {type: 'OPR', val: 'ADD'},
                operands: [
                    {type: 'REG', val: 4},
                    {type: 'REG', val: 5},
                    {type: 'NUM', val: 0}
                ]
            },{
                line: 5,
                operator: {type: 'OPR', val: 'ADD'},
                operands: [
                    {type: 'REG', val: 6},
                    {type: 'REG', val: 7},
                    {type: 'NUM', val: 0}
                ]
            },{
                line: 6,
                operator: {type: 'DIR', val: 'END'},
                operands: []
            }
        ]
    };
    deepEqual(LC2.parse(input_tokens), expected_ob);
});

test("test directives on actual program", function() {
    var input_ob = {
        lines: [
            {
                line: 2,
                operator: {type: 'DIR', val: 'ORIG'},
                operands: [
                    {type: 'NUM', val: parseInt('4000', 16)}
                ]
            },{
                line: 3,
                symbol: 'ZERO',
                operator: {type: 'OPR', val: 'AND'},
                operands: [
                    {type: 'REG', val: 0},
                    {type: 'REG', val: 0},
                    {type: 'NUM', val: 0}
                ]
            },{
                line: 4,
                symbol: 'HELLO',
                operator: {type: 'DIR', val: 'STRINGZ'},
                operands: [
                    {type: 'STR', val: 'Hello, world!'}
                ]
            },{
                line: 5,
                operator: {type: 'DIR', val: 'END'},
                operands: []
            }
        ]
    };
    var expected_ob = {
        symbols: {
            'HELLO' : parseInt('4001', 16)
        },
        bytecode: {
            "16385": 72,
            "16386": 101,
            "16387": 108,
            "16388": 108,
            "16389": 111,
            "16390": 44,
            "16391": 32,
            "16392": 119,
            "16393": 111,
            "16394": 114,
            "16395": 108,
            "16396": 100,
            "16397": 33,
            "16398": 0
        },
        lines: [
            {
                address: parseInt('4000', 16),
                line: 3,
                symbol: 'ZERO',
                operator: {type: 'OPR', val: 'AND'},
                operands: [
                    {type: 'REG', val: 0},
                    {type: 'REG', val: 0},
                    {type: 'NUM', val: 0}
                ]
            }
        ]
    };
    deepEqual(LC2.run_directives(input_ob), expected_ob);
});

test("test build symbol table on actual program", function() {
    var input_ob = {
        symbols: {
            'HELLO' : parseInt('4001', 16)
        },
        bytecode: {
            "16385": 72,
            "16386": 101,
            "16387": 108,
            "16388": 108,
            "16389": 111,
            "16390": 44,
            "16391": 32,
            "16392": 119,
            "16393": 111,
            "16394": 114,
            "16395": 108,
            "16396": 100,
            "16397": 33,
            "16398": 0
        },
        lines: [
            {
                address: parseInt('4000', 16),
                line: 3,
                symbol: 'ZERO',
                operator: {type: 'OPR', val: 'AND'},
                operands: [
                    {type: 'REG', val: 0},
                    {type: 'REG', val: 0},
                    {type: 'NUM', val: 0}
                ]
            }
        ]
    };
    var expected_ob = {
        symbols: {
            'ZERO'  : parseInt('4000', 16),
            'HELLO' : parseInt('4001', 16)
        },
        bytecode: {
            "16385": 72,
            "16386": 101,
            "16387": 108,
            "16388": 108,
            "16389": 111,
            "16390": 44,
            "16391": 32,
            "16392": 119,
            "16393": 111,
            "16394": 114,
            "16395": 108,
            "16396": 100,
            "16397": 33,
            "16398": 0
        },
        lines: [
            {
                address: parseInt('4000', 16),
                line: 3,
                operator: {type: 'OPR', val: 'AND'},
                operands: [
                    {type: 'REG', val: 0},
                    {type: 'REG', val: 0},
                    {type: 'NUM', val: 0}
                ]
            }
        ]
    };
    deepEqual(LC2.build_symbol_table(input_ob), expected_ob);
});

test("test translate actual program", function() {
    var input_ob = {
        symbols: {
            'ZERO'  : parseInt('4000', 16),
            'HELLO' : parseInt('4001', 16)
        },
        bytecode: {
            "16385": 72,
            "16386": 101,
            "16387": 108,
            "16388": 108,
            "16389": 111,
            "16390": 44,
            "16391": 32,
            "16392": 119,
            "16393": 111,
            "16394": 114,
            "16395": 108,
            "16396": 100,
            "16397": 33,
            "16398": 0
        },
        lines: [
            {
                address: parseInt('4000', 16),
                line: 3,
                operator: {type: 'OPR', val: 'AND'},
                operands: [
                    {type: 'REG', val: 0},
                    {type: 'REG', val: 0},
                    {type: 'NUM', val: 0}
                ]
            }
        ]
    };
    var expected_ob = {
        "16384": parseInt('0101000000100000',2),
        "16385": 72,
        "16386": 101,
        "16387": 108,
        "16388": 108,
        "16389": 111,
        "16390": 44,
        "16391": 32,
        "16392": 119,
        "16393": 111,
        "16394": 114,
        "16395": 108,
        "16396": 100,
        "16397": 33,
        "16398": 0
    };
    deepEqual(LC2.translate(input_ob), expected_ob);
});

test("test assemble actual program", function() {
    var str = "";
    str += "; myprog.asm\n";
    str += ".ORIG $4000\n";
    str += "ZERO: AND R0, R0, #0 ;zero out R0\n";
    str += 'HELLO: .STRINGZ "Hello, world!" ; never used\n';
    str += ".END\n";
    var expected_ob = {
        "16384": parseInt('0101000000100000',2),
        "16385": 72,
        "16386": 101,
        "16387": 108,
        "16388": 108,
        "16389": 111,
        "16390": 44,
        "16391": 32,
        "16392": 119,
        "16393": 111,
        "16394": 114,
        "16395": 108,
        "16396": 100,
        "16397": 33,
        "16398": 0
    };
    deepEqual(LC2.assemble(str), expected_ob);
});

test("test lex dumbadd.asm", function() {
    var input_source = lib.readFromURL('dumbadd.asm');
    var expected_lexemes =[
        {
            "line": 11,
            "type": "DIR",
            "val": "ORIG"
        },
        {
            "line": 11,
            "type": "HEX",
            "val": "3000"
        },
        {
            "line": 14,
            "type": "OPR",
            "val": "IN"
        },
        {
            "line": 15,
            "type": "OPR",
            "val": "ADD"
        },
        {
            "line": 15,
            "type": "REG",
            "val": "1"
        },
        {
            "line": 15,
            "type": "REG",
            "val": "0"
        },
        {
            "line": 15,
            "type": "DEC",
            "val": "0"
        },
        {
            "line": 16,
            "type": "OPR",
            "val": "IN"
        },
        {
            "line": 19,
            "type": "OPR",
            "val": "ADD"
        },
        {
            "line": 19,
            "type": "REG",
            "val": "0"
        },
        {
            "line": 19,
            "type": "REG",
            "val": "0"
        },
        {
            "line": 19,
            "type": "REG",
            "val": "1"
        },
        {
            "line": 22,
            "type": "OPR",
            "val": "OUT"
        },
        {
            "line": 23,
            "type": "OPR",
            "val": "HALT"
        },
        {
            "line": 24,
            "type": "DIR",
            "val": "END"
        }
    ];
    deepEqual(LC2.lex(input_source), expected_lexemes);
});

test("test assemble dumbadd.asm", function() {
    var input_source = lib.readFromURL('dumbadd.asm');
    var expected_ob = {
        "12288" : parseInt('1111000000100011', 2),
        "12289" : parseInt('0001001000100000', 2),
        "12290" : parseInt('1111000000100011', 2),
        "12291" : parseInt('0001000000000001', 2),
        "12292" : parseInt('1111000000100001', 2),
        "12293" : parseInt('1111000000100101', 2)
    };
    deepEqual(LC2.assemble(input_source), expected_ob);
});

test("test lex reverse.asm", function() {
    var input_source = lib.readFromURL('reverse.asm');
    var expected_lexemes =[
        {
            "line": 13,
            "type": "DIR",
            "val": "ORIG"
        },
        {
            "line": 13,
            "type": "HEX",
            "val": "3000"
        },
        {
            "line": 16,
            "type": "OPR",
            "val": "LEA"
        },
        {
            "line": 16,
            "type": "REG",
            "val": "3"
        },
        {
            "line": 16,
            "type": "REF",
            "val": "BUFFER"
        },
        {
            "line": 17,
            "type": "OPR",
            "val": "AND"
        },
        {
            "line": 17,
            "type": "REG",
            "val": "2"
        },
        {
            "line": 17,
            "type": "REG",
            "val": "2"
        },
        {
            "line": 17,
            "type": "DEC",
            "val": "0"
        },
        {
            "line": 20,
            "type": "SYM",
            "val": "READ"
        },
        {
            "line": 20,
            "type": "OPR",
            "val": "IN"
        },
        {
            "line": 21,
            "type": "OPR",
            "val": "ADD"
        },
        {
            "line": 21,
            "type": "REG",
            "val": "1"
        },
        {
            "line": 21,
            "type": "REG",
            "val": "0"
        },
        {
            "line": 21,
            "type": "HEX",
            "val": "-A"
        },
        {
            "line": 22,
            "type": "OPR",
            "val": "BRZ"
        },
        {
            "line": 22,
            "type": "REF",
            "val": "PRNTIT"
        },
        {
            "line": 23,
            "type": "OPR",
            "val": "STR"
        },
        {
            "line": 23,
            "type": "REG",
            "val": "0"
        },
        {
            "line": 23,
            "type": "REG",
            "val": "3"
        },
        {
            "line": 23,
            "type": "DEC",
            "val": "0"
        },
        {
            "line": 24,
            "type": "OPR",
            "val": "ADD"
        },
        {
            "line": 24,
            "type": "REG",
            "val": "3"
        },
        {
            "line": 24,
            "type": "REG",
            "val": "3"
        },
        {
            "line": 24,
            "type": "DEC",
            "val": "1"
        },
        {
            "line": 25,
            "type": "OPR",
            "val": "ADD"
        },
        {
            "line": 25,
            "type": "REG",
            "val": "2"
        },
        {
            "line": 25,
            "type": "REG",
            "val": "2"
        },
        {
            "line": 25,
            "type": "DEC",
            "val": "1"
        },
        {
            "line": 26,
            "type": "OPR",
            "val": "JMP"
        },
        {
            "line": 26,
            "type": "REF",
            "val": "READ"
        },
        {
            "line": 28,
            "type": "SYM",
            "val": "PRNTIT"
        },
        {
            "line": 28,
            "type": "OPR",
            "val": "ADD"
        },
        {
            "line": 28,
            "type": "REG",
            "val": "3"
        },
        {
            "line": 28,
            "type": "REG",
            "val": "3"
        },
        {
            "line": 28,
            "type": "DEC",
            "val": "-1"
        },
        {
            "line": 31,
            "type": "SYM",
            "val": "PRINT"
        },
        {
            "line": 31,
            "type": "OPR",
            "val": "AND"
        },
        {
            "line": 31,
            "type": "REG",
            "val": "2"
        },
        {
            "line": 31,
            "type": "REG",
            "val": "2"
        },
        {
            "line": 31,
            "type": "REG",
            "val": "2"
        },
        {
            "line": 32,
            "type": "OPR",
            "val": "BRZ"
        },
        {
            "line": 32,
            "type": "REF",
            "val": "DONE"
        },
        {
            "line": 33,
            "type": "OPR",
            "val": "LDR"
        },
        {
            "line": 33,
            "type": "REG",
            "val": "0"
        },
        {
            "line": 33,
            "type": "REG",
            "val": "3"
        },
        {
            "line": 33,
            "type": "DEC",
            "val": "0"
        },
        {
            "line": 34,
            "type": "OPR",
            "val": "OUT"
        },
        {
            "line": 35,
            "type": "OPR",
            "val": "ADD"
        },
        {
            "line": 35,
            "type": "REG",
            "val": "2"
        },
        {
            "line": 35,
            "type": "REG",
            "val": "2"
        },
        {
            "line": 35,
            "type": "DEC",
            "val": "-1"
        },
        {
            "line": 36,
            "type": "OPR",
            "val": "ADD"
        },
        {
            "line": 36,
            "type": "REG",
            "val": "3"
        },
        {
            "line": 36,
            "type": "REG",
            "val": "3"
        },
        {
            "line": 36,
            "type": "DEC",
            "val": "-1"
        },
        {
            "line": 37,
            "type": "OPR",
            "val": "JMP"
        },
        {
            "line": 37,
            "type": "REF",
            "val": "PRINT"
        },
        {
            "line": 39,
            "type": "SYM",
            "val": "DONE"
        },
        {
            "line": 39,
            "type": "OPR",
            "val": "HALT"
        },
        {
            "line": 42,
            "type": "SYM",
            "val": "BUFFER"
        },
        {
            "line": 42,
            "type": "DIR",
            "val": "BLKW"
        },
        {
            "line": 42,
            "type": "DEC",
            "val": "10"
        },
        {
            "line": 42,
            "type": "HEX",
            "val": "0000"
        },
        {
            "line": 43,
            "type": "DIR",
            "val": "END"
        },
    ];
    deepEqual(LC2.lex(input_source), expected_lexemes);
});

test("test assemble reverse.asm", function() {
    // Note for future hand-assemblers:
    //   page offset starts at the page boundary, which is probably the first
    //   line of the program
    var input_source = lib.readFromURL('reverse.asm');
    var expected_ob = {
        "12288" : parseInt('1110011000010010', 2),
        "12289" : parseInt('0101010010100000', 2),
        "12290" : parseInt('1111000000100011', 2),
        "12291" : parseInt('0001001000110110', 2),
        "12292" : parseInt('0000010000001001', 2),
        "12293" : parseInt('0111000011000000', 2),
        "12294" : parseInt('0001011011100001', 2),
        "12295" : parseInt('0001010010100001', 2),
        "12296" : parseInt('0100000000000010', 2),
        "12297" : parseInt('0001011011111111', 2),
        "12298" : parseInt('0101010010000010', 2),
        "12299" : parseInt('0000010000010001', 2),
        "12300" : parseInt('0110000011000000', 2),
        "12301" : parseInt('1111000000100001', 2),
        "12302" : parseInt('0001010010111111', 2),
        "12303" : parseInt('0001011011111111', 2),
        "12304" : parseInt('0100000000001010', 2),
        "12305" : parseInt('1111000000100101', 2),
        "12306" : parseInt('0000000000000000', 2),
        "12307" : parseInt('0000000000000000', 2),
        "12308" : parseInt('0000000000000000', 2),
        "12309" : parseInt('0000000000000000', 2),
        "12310" : parseInt('0000000000000000', 2),
        "12311" : parseInt('0000000000000000', 2),
        "12312" : parseInt('0000000000000000', 2),
        "12313" : parseInt('0000000000000000', 2),
        "12314" : parseInt('0000000000000000', 2),
        "12315" : parseInt('0000000000000000', 2)
    };
    deepEqual(LC2.assemble(input_source), expected_ob);
});

test("lex justtest.asm",function() {
    var input_source = lib.readFromURL('justtest.asm');
    var expected_lexemes = [
        {
            "line": 1,
            "type": "SYM",
            "val": "START"
        },
        {
            "line": 1,
            "type": "OPR",
            "val": "NOP"
        },
        {
            "line": 2,
            "type": "OPR",
            "val": "BR"
        },
        {
            "line": 3,
            "type": "OPR",
            "val": "BRN"
        },
        {
            "line": 3,
            "type": "REF",
            "val": "START"
        },
        {
            "line": 4,
            "type": "OPR",
            "val": "BRP"
        },
        {
            "line": 4,
            "type": "REF",
            "val": "START"
        },
        {
            "line": 5,
            "type": "OPR",
            "val": "BRNZ"
        },
        {
            "line": 5,
            "type": "REF",
            "val": "START"
        },
        {
            "line": 6,
            "type": "OPR",
            "val": "BRZP"
        },
        {
            "line": 6,
            "type": "REF",
            "val": "START"
        },
        {
            "line": 7,
            "type": "OPR",
            "val": "BRNZP"
        },
        {
            "line": 7,
            "type": "REF",
            "val": "START"
        },
        {
            "line": 8,
            "type": "OPR",
            "val": "JMPR"
        },
        {
            "line": 8,
            "type": "REG",
            "val": "5"
        },
        {
            "line": 8,
            "type": "DEC",
            "val": "5"
        },
        {
            "line": 9,
            "type": "OPR",
            "val": "JSR"
        },
        {
            "line": 9,
            "type": "DEC",
            "val": "5"
        },
        {
            "line": 10,
            "type": "OPR",
            "val": "JSRR"
        },
        {
            "line": 10,
            "type": "REG",
            "val": "5"
        },
        {
            "line": 10,
            "type": "DEC",
            "val": "5"
        },
        {
            "line": 11,
            "type": "OPR",
            "val": "LD"
        },
        {
            "line": 11,
            "type": "REG",
            "val": "5"
        },
        {
            "line": 11,
            "type": "DEC",
            "val": "5"
        },
        {
            "line": 12,
            "type": "OPR",
            "val": "LDI"
        },
        {
            "line": 12,
            "type": "REG",
            "val": "5"
        },
        {
            "line": 12,
            "type": "DEC",
            "val": "5"
        },
        {
            "line": 13,
            "type": "OPR",
            "val": "NOT"
        },
        {
            "line": 13,
            "type": "REG",
            "val": "5"
        },
        {
            "line": 13,
            "type": "REG",
            "val": "7"
        },
        {
            "line": 14,
            "type": "OPR",
            "val": "ST"
        },
        {
            "line": 14,
            "type": "REG",
            "val": "5"
        },
        {
            "line": 14,
            "type": "DEC",
            "val": "5"
        },
        {
            "line": 15,
            "type": "OPR",
            "val": "STI"
        },
        {
            "line": 15,
            "type": "REG",
            "val": "5"
        },
        {
            "line": 15,
            "type": "DEC",
            "val": "5"
        },
        {
            "line": 16,
            "type": "OPR",
            "val": "TRAP"
        },
        {
            "line": 16,
            "type": "DEC",
            "val": "5"
        },
        {
            "line": 17,
            "type": "OPR",
            "val": "RET"
        },
        {
            "line": 18,
            "type": "OPR",
            "val": "RTI"
        },
        {
            "line": 19,
            "type": "DIR",
            "val": "FILL"
        },
        {
            "line": 19,
            "type": "DEC",
            "val": "5"
        },
        {
            "line": 20,
            "type": "DIR",
            "val": "STRINGZ"
        },
        {
            "line": 20,
            "type": "STR",
            "val": "Hello, world!"
        },
        {
            "line": 21,
            "type": "DIR",
            "val": "END"
        },
        {
            "line": 22,
            "type": "OPR",
            "val": "NOP"
        },
    ];
    deepEqual(LC2.lex(input_source), expected_lexemes);
});

test("test assemble justtest.asm", function() {
    var input_source = lib.readFromURL('justtest.asm');
    var expected_ob = {
        "12288": parseInt("0000000000000000",2), // nop
        "12289": parseInt("0000000000000000",2), // br
        "12290": parseInt("0000100000000000",2),
        "12291": parseInt("0000001000000000",2),
        "12292": parseInt("0000110000000000",2),
        "12293": parseInt("0000011000000000",2),
        "12294": parseInt("0000111000000000",2),
        "12295": parseInt("1100000101000101",2),
        "12296": parseInt("0100100000000101",2),
        "12297": parseInt("1100100101000101",2),
        "12298": parseInt("0010101000000101",2),
        "12299": parseInt("1010101000000101",2),
        "12300": parseInt("1001101111111111",2),
        "12301": parseInt("0011101000000101",2),
        "12302": parseInt("1011101000000101",2),
        "12303": parseInt("1111000000000101",2),
        "12304": parseInt("1101000000000000",2),
        "12305": parseInt("1000000000000000",2),
        "12306": parseInt("0000000000000101",2),
        
        "12307": parseInt("0000000001001000",2), // 0x48 H
        "12308": parseInt("0000000001100101",2), // 0x65 e
        "12309": parseInt("0000000001101100",2), // 0x6C l
        "12310": parseInt("0000000001101100",2), // 0x6C l
        "12311": parseInt("0000000001101111",2), // 0x6F o
        "12312": parseInt("0000000000101100",2), // 0x2C ,
        "12313": parseInt("0000000000100000",2), // 0x20  
        "12314": parseInt("0000000001110111",2), // 0x77 w
        "12315": parseInt("0000000001101111",2), // 0x6F o
        "12316": parseInt("0000000001110010",2), // 0x72 r
        "12317": parseInt("0000000001101100",2), // 0x6C l
        "12318": parseInt("0000000001100100",2), // 0x64 d
        "12319": parseInt("0000000000100001",2), // 0x21 !
        "12320": parseInt("0000000000000000",2), // 0x00 \0
        
        "12321": parseInt("0000000000000000",2), // nop
    };
    deepEqual(LC2.assemble(input_source), expected_ob);
});
