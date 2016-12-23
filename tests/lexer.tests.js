module('lexer.js');

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
              [{type: 'STRING', line: 1, val: 'Hello, world!'}]);
    deepEqual(lexer.lex('    "Hello, world!"        ',str_spec),
              [{type: 'STRING', line: 1, val: 'Hello, world!'}]);
    deepEqual(lexer.lex(' blah    "Hello, world!"   herp     ',str_spec),
              [{type: 'STRING', line: 1, val: 'Hello, world!'}]);
});

test("multi string tokenization", function() {
    deepEqual(lexer.lex('"Hello, world!""The quick brown fox jumps over the lazy dog"',str_spec),
              [
                  {type: 'STRING', line: 1, val: 'Hello, world!'},
                  {type: 'STRING', line: 1, val: 'The quick brown fox jumps over the lazy dog'}
              ]);
    deepEqual(lexer.lex('    "Hello, world!"   "The quick brown fox jumps over the lazy dog"     ',str_spec),
              [
                  {type: 'STRING', line: 1, val: 'Hello, world!'},
                  {type: 'STRING', line: 1, val: 'The quick brown fox jumps over the lazy dog'}
              ]);
    deepEqual(lexer.lex(' blah    "Hello, world!"   herp   "The quick brown fox jumps over the lazy dog" derp  ',str_spec),
              [
                  {type: 'STRING', line: 1, val: 'Hello, world!'},
                  {type: 'STRING', line: 1, val: 'The quick brown fox jumps over the lazy dog'}
              ]);
});

test("multi line assembly lexing", function() {
    var str = '';
    str += '  ;; this is a comment \n';
    str += '  ;; this is a comment \n';
    str += '  ;; this is a comment \n';
    str += '  ;; this is a comment \n';
    str += '\n';
    str += 'LABEL: add R0, R0, R0 \n';
    deepEqual(lexer.lex(str,LC2.spec),[
        {type: 'SYM', line: 6, val: 'LABEL'},
        {type: 'KEY', line: 6, val: 'add'},
        {type: 'REG', line: 6, val: '0'},
        {type: 'REG', line: 6, val: '0'},
        {type: 'REG', line: 6, val: '0'}
    ]);
});
