var str_spec = {
	states: {
		OUTSIDE: [
			{
				regex:/^"/,
				next_state: 'IN_A_STRING'
			},
			{
				regex:/^[^"]*/,
			}
		],
		IN_A_STRING: [
			{
				regex:/^"/,
				next_state: 'OUTSIDE'
			},
			{
				regex:/^[^"]*/,
				type: 'STRING'
			}
		]
	},
	start_state: 'OUTSIDE'
};

test("single string tokenization", function() {
	deepEqual(lexer.lex('"Hello, world!"',str_spec),
			  [{type: 'STRING', val: 'Hello, world!'}]);
	deepEqual(lexer.lex('    "Hello, world!"        ',str_spec),
			  [{type: 'STRING', val: 'Hello, world!'}]);
	deepEqual(lexer.lex(' blah    "Hello, world!"   herp     ',str_spec),
			  [{type: 'STRING', val: 'Hello, world!'}]);
});

test("multi string tokenization", function() {
	deepEqual(lexer.lex('"Hello, world!""The quick brown fox jumps over the lazy dog"',str_spec),
			  [
				  {type: 'STRING', val: 'Hello, world!'},
				  {type: 'STRING', val: 'The quick brown fox jumps over the lazy dog'}
			  ]);
	deepEqual(lexer.lex('    "Hello, world!"   "The quick brown fox jumps over the lazy dog"     ',str_spec),
			  [
				  {type: 'STRING', val: 'Hello, world!'},
				  {type: 'STRING', val: 'The quick brown fox jumps over the lazy dog'}
			  ]);
	deepEqual(lexer.lex(' blah    "Hello, world!"   herp   "The quick brown fox jumps over the lazy dog" derp  ',str_spec),
			  [
				  {type: 'STRING', val: 'Hello, world!'},
				  {type: 'STRING', val: 'The quick brown fox jumps over the lazy dog'}
			  ]);
});
