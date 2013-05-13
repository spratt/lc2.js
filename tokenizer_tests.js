var str_spec = {
	states: {
		OUTSIDE: function(str,tokens) {
			if(str[0] === '"')
				str_spec.state = 'IN_A_STRING';
			return 1;
		},
		IN_A_STRING: function(str,tokens) {
			var new_string = '';
			var i = 0;
			var ch = '';
			while((ch = str[i++]) !== '"') {
				if(i >= str.length) throw new Error("Tokenizer error");
				new_string += ch;
			}
			str_spec.state = 'OUTSIDE';
			tokens.push(new_string);
			return i;
		}
	},
	state: 'OUTSIDE'
};

test("single string tokenization", function() {
	deepEqual(tokenizer.tokenize('"Hello, world!"',str_spec),
			  ['Hello, world!']);
	deepEqual(tokenizer.tokenize('    "Hello, world!"        ',str_spec),
			  ['Hello, world!']);
	deepEqual(tokenizer.tokenize(' blah    "Hello, world!"   herp     ',str_spec),
			  ['Hello, world!']);
});

test("multi string tokenization", function() {
	deepEqual(tokenizer.tokenize('"Hello, world!""The quick brown fox jumps over the lazy dog"',str_spec),
			  ['Hello, world!','The quick brown fox jumps over the lazy dog']);
	deepEqual(tokenizer.tokenize('    "Hello, world!"   "The quick brown fox jumps over the lazy dog"     ',str_spec),
			  ['Hello, world!','The quick brown fox jumps over the lazy dog']);
	deepEqual(tokenizer.tokenize(' blah    "Hello, world!"   herp   "The quick brown fox jumps over the lazy dog" derp  ',str_spec),
			  ['Hello, world!','The quick brown fox jumps over the lazy dog']);
});
