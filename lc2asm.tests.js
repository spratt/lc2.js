module('lc2asm.js');

test("test lexing actual program", function() {
	var str = "";
	str += "; myprog.asm\n";
	str += ".ORIG $4000\n";
	str += "ZERO AND R0, R0, #0 ;zero out R0\n";
	str += 'HELLO .STRINGZ "Hello, world!" ; never used\n';
	str += ".END\n";
	var expected_tokens = [
		{type: 'DIR', line: 1, val: '.ORIG'},
		{type: 'NUM', line: 1, val: '$4000'},
		{type: 'KEY', line: 2, val: 'ZERO'},
		{type: 'KEY', line: 2, val: 'AND'},
		{type: 'REG', line: 2, val: 'R0'},
		{type: 'REG', line: 2, val: 'R0'},
		{type: 'NUM', line: 2, val: '#0'},
		{type: 'KEY', line: 3, val: 'HELLO'},
		{type: 'DIR', line: 3, val: '.STRINGZ'},
		{type: 'STR', line: 3, val: 'Hello, world!'},
		{type: 'DIR', line: 4, val: '.END'}
	];
	deepEqual(LC2.lex(str), expected_tokens);
});

test("test parsing actual program", function() {
	var input_tokens = [
		{type: 'DIR', line: 1, val: '.ORIG'},
		{type: 'NUM', line: 1, val: '$4000'},
		{type: 'KEY', line: 2, val: 'ZERO'},
		{type: 'KEY', line: 2, val: 'AND'},
		{type: 'REG', line: 2, val: 'R0'},
		{type: 'REG', line: 2, val: 'R0'},
		{type: 'NUM', line: 2, val: '#0'},
		{type: 'KEY', line: 3, val: 'HELLO'},
		{type: 'DIR', line: 3, val: '.STRINGZ'},
		{type: 'STR', line: 3, val: 'Hello, world!'},
		{type: 'DIR', line: 4, val: '.END'}
	];
	var expected_ob = {
		lines: [
			{
				line: 1,
				operator: {type: 'DIR', val: '.ORIG'},
				operands: [
					{type: 'NUM', val: parseInt('4000', 16)}
				]
			},{
				line: 2,
				symbol: {type: 'KEY', val: 'ZERO'},
				operator: {type: 'KEY', val: 'AND'},
				operands: [
					{type: 'REG', val: 0},
					{type: 'REG', val: 0},
					{type: 'NUM', val: 0}
				]
			},{
				line: 3,
				symbol: {type: 'KEY', val: 'HELLO'},
				operator: {type: 'DIR', val: '.STRINGZ'},
				operands: [
					{type: 'STR', val: 'Hello, world!'}
				]
			},{
				line: 4,
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
				line: 1,
				operator: {type: 'DIR', val: '.ORIG'},
				operands: [
					{type: 'NUM', val: parseInt('4000', 16)}
				]
			},{
				line: 2,
				symbol: {type: 'KEY', val: 'ZERO'},
				operator: {type: 'KEY', val: 'AND'},
				operands: [
					{type: 'REG', val: 0},
					{type: 'REG', val: 0},
					{type: 'NUM', val: 0}
				]
			},{
				line: 3,
				symbol: {type: 'KEY', val: 'HELLO'},
				operator: {type: 'DIR', val: '.STRINGZ'},
				operands: [
					{type: 'STR', val: 'Hello, world!'}
				]
			},{
				line: 4,
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
				line: 2,
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
				line: 2,
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
				line: 2,
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
				line: 2,
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
