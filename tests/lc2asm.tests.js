module('lc2asm.js');

test("test lexing actual program", function() {
	var str = "";
	str += "; myprog.asm\n";
	str += ".ORIG $4000\n";
	str += "ZERO AND R0, R0, #0 ;zero out R0\n";
	str += 'HELLO .STRINGZ "Hello, world!" ; never used\n';
	str += ".END\n";
	var expected_tokens = [
		{type: 'DIR', line: 2, val: '.ORIG'},
		{type: 'HEX', line: 2, val: '4000'},
		{type: 'KEY', line: 3, val: 'ZERO'},
		{type: 'KEY', line: 3, val: 'AND'},
		{type: 'REG', line: 3, val: 'R0'},
		{type: 'REG', line: 3, val: 'R0'},
		{type: 'DEC', line: 3, val: '0'},
		{type: 'KEY', line: 4, val: 'HELLO'},
		{type: 'DIR', line: 4, val: '.STRINGZ'},
		{type: 'STR', line: 4, val: 'Hello, world!'},
		{type: 'DIR', line: 5, val: '.END'}
	];
	deepEqual(LC2.lex(str), expected_tokens);
});

test("test parsing actual program", function() {
	var input_tokens = [
		{type: 'DIR', line: 2, val: '.ORIG'},
		{type: 'HEX', line: 2, val: '4000'},
		{type: 'KEY', line: 3, val: 'ZERO'},
		{type: 'KEY', line: 3, val: 'AND'},
		{type: 'REG', line: 3, val: 'R0'},
		{type: 'REG', line: 3, val: 'R0'},
		{type: 'DEC', line: 3, val: '0'},
		{type: 'KEY', line: 4, val: 'HELLO'},
		{type: 'DIR', line: 4, val: '.STRINGZ'},
		{type: 'STR', line: 4, val: 'Hello, world!'},
		{type: 'DIR', line: 5, val: '.END'}
	];
	var expected_ob = {
		lines: [
			{
				line: 2,
				operator: {type: 'DIR', val: '.ORIG'},
				operands: [
					{type: 'NUM', val: parseInt('4000', 16)}
				]
			},{
				line: 3,
				symbol: 'ZERO',
				operator: {type: 'KEY', val: 'AND'},
				operands: [
					{type: 'REG', val: 0},
					{type: 'REG', val: 0},
					{type: 'NUM', val: 0}
				]
			},{
				line: 4,
				symbol: 'HELLO',
				operator: {type: 'DIR', val: '.STRINGZ'},
				operands: [
					{type: 'STR', val: 'Hello, world!'}
				]
			},{
				line: 5,
				operator: {type: 'DIR', val: '.END'},
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
				operator: {type: 'DIR', val: '.ORIG'},
				operands: [
					{type: 'NUM', val: parseInt('4000', 16)}
				]
			},{
				line: 3,
				symbol: 'ZERO',
				operator: {type: 'KEY', val: 'AND'},
				operands: [
					{type: 'REG', val: 0},
					{type: 'REG', val: 0},
					{type: 'NUM', val: 0}
				]
			},{
				line: 4,
				symbol: 'HELLO',
				operator: {type: 'DIR', val: '.STRINGZ'},
				operands: [
					{type: 'STR', val: 'Hello, world!'}
				]
			},{
				line: 5,
				operator: {type: 'DIR', val: '.END'},
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
				operator: {type: 'KEY', val: 'AND'},
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
				operator: {type: 'KEY', val: 'AND'},
				operands: [
					{type: 'REG', val: 'R0'},
					{type: 'REG', val: 'R0'},
					{type: 'NUM', val: '#0'}
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
				operator: {type: 'KEY', val: 'AND'},
				operands: [
					{type: 'REG', val: 'R0'},
					{type: 'REG', val: 'R0'},
					{type: 'NUM', val: '#0'}
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
				operator: {type: 'KEY', val: 'AND'},
				operands: [
					{type: 'REG', val: 'R0'},
					{type: 'REG', val: 'R0'},
					{type: 'NUM', val: '#0'}
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
	str += "ZERO AND R0, R0, #0 ;zero out R0\n";
	str += 'HELLO .STRINGZ "Hello, world!" ; never used\n';
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
			"val": ".ORIG"
		},
		{
			"line": 11,
			"type": "NUM",
			"val": "$3000"
		},
		{
			"line": 14,
			"type": "KEY",
			"val": "IN"
		},
		{
			"line": 15,
			"type": "KEY",
			"val": "ADD"
		},
		{
			"line": 15,
			"type": "REG",
			"val": "R1"
		},
		{
			"line": 15,
			"type": "REG",
			"val": "R0"
		},
		{
			"line": 15,
			"type": "NUM",
			"val": "#0"
		},
		{
			"line": 16,
			"type": "KEY",
			"val": "IN"
		},
		{
			"line": 19,
			"type": "KEY",
			"val": "ADD"
		},
		{
			"line": 19,
			"type": "REG",
			"val": "R0"
		},
		{
			"line": 19,
			"type": "REG",
			"val": "R0"
		},
		{
			"line": 19,
			"type": "REG",
			"val": "R1"
		},
		{
			"line": 22,
			"type": "KEY",
			"val": "OUT"
		},
		{
			"line": 23,
			"type": "KEY",
			"val": "HALT"
		},
		{
			"line": 24,
			"type": "DIR",
			"val": ".END"
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
			"val": ".ORIG"
		},
		{
			"line": 13,
			"type": "NUM",
			"val": "$3000"
		},
		{
			"line": 16,
			"type": "KEY",
			"val": "LEA"
		},
		{
			"line": 16,
			"type": "REG",
			"val": "R3"
		},
		{
			"line": 16,
			"type": "KEY",
			"val": "BUFFER"
		},
		{
			"line": 17,
			"type": "KEY",
			"val": "AND"
		},
		{
			"line": 17,
			"type": "REG",
			"val": "R2"
		},
		{
			"line": 17,
			"type": "REG",
			"val": "R2"
		},
		{
			"line": 17,
			"type": "NUM",
			"val": "#0"
		},
		{
			"line": 20,
			"type": "KEY",
			"val": "READ:"
		},
		{
			"line": 20,
			"type": "KEY",
			"val": "IN"
		},
		{
			"line": 21,
			"type": "KEY",
			"val": "ADD"
		},
		{
			"line": 21,
			"type": "REG",
			"val": "R1"
		},
		{
			"line": 21,
			"type": "REG",
			"val": "R0"
		},
		{
			"line": 21,
			"type": "NUM",
			"val": "$-A"
		},
		{
			"line": 22,
			"type": "KEY",
			"val": "BRZ"
		},
		{
			"line": 22,
			"type": "KEY",
			"val": "PRNTIT"
		},
		{
			"line": 23,
			"type": "KEY",
			"val": "STR"
		},
		{
			"line": 23,
			"type": "REG",
			"val": "R0"
		},
		{
			"line": 23,
			"type": "REG",
			"val": "R3"
		},
		{
			"line": 23,
			"type": "NUM",
			"val": "#0"
		},
		{
			"line": 24,
			"type": "KEY",
			"val": "ADD"
		},
		{
			"line": 24,
			"type": "REG",
			"val": "R3"
		},
		{
			"line": 24,
			"type": "REG",
			"val": "R3"
		},
		{
			"line": 24,
			"type": "NUM",
			"val": "#1"
		},
		{
			"line": 25,
			"type": "KEY",
			"val": "ADD"
		},
		{
			"line": 25,
			"type": "REG",
			"val": "R2"
		},
		{
			"line": 25,
			"type": "REG",
			"val": "R2"
		},
		{
			"line": 25,
			"type": "NUM",
			"val": "#1"
		},
		{
			"line": 26,
			"type": "KEY",
			"val": "JMP"
		},
		{
			"line": 26,
			"type": "KEY",
			"val": "READ"
		},
		{
			"line": 28,
			"type": "KEY",
			"val": "PRNTIT:"
		},
		{
			"line": 28,
			"type": "KEY",
			"val": "ADD"
		},
		{
			"line": 28,
			"type": "REG",
			"val": "R3"
		},
		{
			"line": 28,
			"type": "REG",
			"val": "R3"
		},
		{
			"line": 28,
			"type": "NUM",
			"val": "#-1"
		},
		{
			"line": 31,
			"type": "KEY",
			"val": "PRINT:"
		},
		{
			"line": 31,
			"type": "KEY",
			"val": "AND"
		},
		{
			"line": 31,
			"type": "REG",
			"val": "R2"
		},
		{
			"line": 31,
			"type": "REG",
			"val": "R2"
		},
		{
			"line": 31,
			"type": "REG",
			"val": "R2"
		},
		{
			"line": 32,
			"type": "KEY",
			"val": "BRZ"
		},
		{
			"line": 32,
			"type": "KEY",
			"val": "DONE"
		},
		{
			"line": 33,
			"type": "KEY",
			"val": "LDR"
		},
		{
			"line": 33,
			"type": "REG",
			"val": "R0"
		},
		{
			"line": 33,
			"type": "REG",
			"val": "R3"
		},
		{
			"line": 33,
			"type": "NUM",
			"val": "#0"
		},
		{
			"line": 34,
			"type": "KEY",
			"val": "OUT"
		},
		{
			"line": 35,
			"type": "KEY",
			"val": "ADD"
		},
		{
			"line": 35,
			"type": "REG",
			"val": "R2"
		},
		{
			"line": 35,
			"type": "REG",
			"val": "R2"
		},
		{
			"line": 35,
			"type": "NUM",
			"val": "#-1"
		},
		{
			"line": 36,
			"type": "KEY",
			"val": "ADD"
		},
		{
			"line": 36,
			"type": "REG",
			"val": "R3"
		},
		{
			"line": 36,
			"type": "REG",
			"val": "R3"
		},
		{
			"line": 36,
			"type": "NUM",
			"val": "#-1"
		},
		{
			"line": 37,
			"type": "KEY",
			"val": "JMP"
		},
		{
			"line": 37,
			"type": "KEY",
			"val": "PRINT"
		},
		{
			"line": 39,
			"type": "KEY",
			"val": "DONE:"
		},
		{
			"line": 39,
			"type": "KEY",
			"val": "HALT"
		},
		{
			"line": 42,
			"type": "KEY",
			"val": "BUFFER:"
		},
		{
			"line": 42,
			"type": "DIR",
			"val": ".BLKW"
		},
		{
			"line": 42,
			"type": "NUM",
			"val": "10"
		},
		{
			"line": 42,
			"type": "NUM",
			"val": "$0000"
		},
		{
			"line": 43,
			"type": "DIR",
			"val": ".END"
		},
	];
	deepEqual(LC2.lex(input_source), expected_lexemes);
});

test("test assemble reverse.asm", function() {
	var input_source = lib.readFromURL('reverse.asm');
	var expected_ob = {
	};
	deepEqual(LC2.assemble(input_source), expected_ob);
});

test("lex justtest.asm",function() {
	var input_source = lib.readFromURL('justtest.asm');
	var expected_lexemes = [
		{
			"line": 1,
			"type": "KEY",
			"val": "START:"
		},
		{
			"line": 1,
			"type": "KEY",
			"val": "NOP"
		},
		{
			"line": 2,
			"type": "KEY",
			"val": "BR"
		},
		{
			"line": 3,
			"type": "KEY",
			"val": "BRN"
		},
		{
			"line": 3,
			"type": "KEY",
			"val": "START"
		},
		{
			"line": 4,
			"type": "KEY",
			"val": "BRP"
		},
		{
			"line": 4,
			"type": "KEY",
			"val": "START"
		},
		{
			"line": 5,
			"type": "KEY",
			"val": "BRNZ"
		},
		{
			"line": 5,
			"type": "KEY",
			"val": "START"
		},
		{
			"line": 6,
			"type": "KEY",
			"val": "BRZP"
		},
		{
			"line": 6,
			"type": "KEY",
			"val": "START"
		},
		{
			"line": 7,
			"type": "KEY",
			"val": "BRNZP"
		},
		{
			"line": 7,
			"type": "KEY",
			"val": "START"
		},
		{
			"line": 8,
			"type": "KEY",
			"val": "JMPRR"
		},
		{
			"line": 8,
			"type": "REG",
			"val": "R5"
		},
		{
			"line": 8,
			"type": "NUM",
			"val": "#5"
		},
		{
			"line": 9,
			"type": "KEY",
			"val": "JSR"
		},
		{
			"line": 9,
			"type": "NUM",
			"val": "#5"
		},
		{
			"line": 10,
			"type": "KEY",
			"val": "JSRR"
		},
		{
			"line": 10,
			"type": "REG",
			"val": "R5"
		},
		{
			"line": 10,
			"type": "NUM",
			"val": "#5"
		},
		{
			"line": 11,
			"type": "KEY",
			"val": "LD"
		},
		{
			"line": 11,
			"type": "REG",
			"val": "R5"
		},
		{
			"line": 11,
			"type": "NUM",
			"val": "#5"
		},
		{
			"line": 12,
			"type": "KEY",
			"val": "LDI"
		},
		{
			"line": 12,
			"type": "REG",
			"val": "R5"
		},
		{
			"line": 12,
			"type": "NUM",
			"val": "#5"
		},
		{
			"line": 13,
			"type": "KEY",
			"val": "NOT"
		},
		{
			"line": 13,
			"type": "REG",
			"val": "R5"
		},
		{
			"line": 13,
			"type": "REG",
			"val": "R7"
		},
		{
			"line": 14,
			"type": "KEY",
			"val": "ST"
		},
		{
			"line": 14,
			"type": "REG",
			"val": "R5"
		},
		{
			"line": 14,
			"type": "NUM",
			"val": "#5"
		},
		{
			"line": 15,
			"type": "KEY",
			"val": "STI"
		},
		{
			"line": 15,
			"type": "REG",
			"val": "R5"
		},
		{
			"line": 15,
			"type": "NUM",
			"val": "#5"
		},
		{
			"line": 16,
			"type": "KEY",
			"val": "TRAP"
		},
		{
			"line": 16,
			"type": "NUM",
			"val": "#5"
		},
		{
			"line": 17,
			"type": "KEY",
			"val": "RET"
		},
		{
			"line": 18,
			"type": "KEY",
			"val": "RTI"
		},
		{
			"line": 19,
			"type": "DIR",
			"val": ".FILL"
		},
		{
			"line": 19,
			"type": "NUM",
			"val": "#5"
		},
		{
			"line": 20,
			"type": "DIR",
			"val": ".STRINGZ"
		},
		{
			"line": 20,
			"type": "STR",
			"val": "Hello, world!"
		},
		{
			"line": 21,
			"type": "DIR",
			"val": ".END"
		},
		{
			"line": 22,
			"type": "KEY",
			"val": "NOP"
		},
	];
	deepEqual(LC2.lex(input_source), expected_lexemes);
});

test("test assemble justtest.asm", function() {
	var input_source = lib.readFromURL('justtest.asm');
	var expected_ob = {
	};
	deepEqual(LC2.assemble(input_source), expected_ob);
});
