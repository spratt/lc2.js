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
		{type: 'NUM', line: 2, val: '$4000'},
		{type: 'KEY', line: 3, val: 'ZERO'},
		{type: 'KEY', line: 3, val: 'AND'},
		{type: 'REG', line: 3, val: 'R0'},
		{type: 'REG', line: 3, val: 'R0'},
		{type: 'NUM', line: 3, val: '#0'},
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
		{type: 'NUM', line: 2, val: '$4000'},
		{type: 'KEY', line: 3, val: 'ZERO'},
		{type: 'KEY', line: 3, val: 'AND'},
		{type: 'REG', line: 3, val: 'R0'},
		{type: 'REG', line: 3, val: 'R0'},
		{type: 'NUM', line: 3, val: '#0'},
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
				symbol: {type: 'KEY', val: 'ZERO'},
				operator: {type: 'KEY', val: 'AND'},
				operands: [
					{type: 'REG', val: 0},
					{type: 'REG', val: 0},
					{type: 'NUM', val: 0}
				]
			},{
				line: 4,
				symbol: {type: 'KEY', val: 'HELLO'},
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
				symbol: {type: 'KEY', val: 'ZERO'},
				operator: {type: 'KEY', val: 'AND'},
				operands: [
					{type: 'REG', val: 0},
					{type: 'REG', val: 0},
					{type: 'NUM', val: 0}
				]
			},{
				line: 4,
				symbol: {type: 'KEY', val: 'HELLO'},
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
				symbol: {type: 'KEY', val: 'ZERO'},
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
				symbol: {type: 'KEY', val: 'ZERO'},
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

test("test lex bigger program", function() {
	var input_source = lib.readFromURL('test_trap_and_add.asm');
	var expected_lexemes = [
		{
			"line": 7,
			"type": "DIR",
			"val": ".ORIG"
		},
		{
			"line": 7,
			"type": "NUM",
			"val": "$3000"
		},
		{
			"line": 10,
			"type": "KEY",
			"val": "IN"
		},
		{
			"line": 11,
			"type": "KEY",
			"val": "ADD"
		},
		{
			"line": 11,
			"type": "REG",
			"val": "R1"
		},
		{
			"line": 11,
			"type": "REG",
			"val": "R0"
		},
		{
			"line": 11,
			"type": "NUM",
			"val": "#0"
		},
		{
			"line": 12,
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
			"val": "R0"
		},
		{
			"line": 15,
			"type": "REG",
			"val": "R0"
		},
		{
			"line": 15,
			"type": "REG",
			"val": "R1"
		},
		{
			"line": 18,
			"type": "KEY",
			"val": "OUT"
		},
		{
			"line": 19,
			"type": "KEY",
			"val": "HALT"
		},
		{
			"line": 20,
			"type": "DIR",
			"val": ".END"
		}
	];
	deepEqual(LC2.lex(input_source), expected_lexemes);
});

test("test assemble bigger program", function() {
	var input_source = lib.readFromURL('test_trap_and_add.asm');
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
