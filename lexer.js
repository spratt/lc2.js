// lexer.js - A simple lexer in javascript
//
// Author: Simon Pratt
// License: ISC
// Website: http://blog.pr4tt.com/lc2.js/

var lexer = (function(lexer, undefined) {
    lexer.debug = false;
    lexer.log = function(o) { if(lexer.debug) console.log(o); };
    lexer.dir = function(o) { if(lexer.debug) console.dir(o); };

    lexer.lex = function(str,spec) {
        var tokens = [];
        var state = spec.start_state;

        lexer.log('len: ' + str.length);
        str.split('\n').forEach(function(line_str,line_num) {
            lexer.log(line_num + ': "' + line_str + '"');
            line_str += '\n'; // replace removed newline
            var start = 0;
            while(start < line_str.length) {
                lexer.log('start: ' + start);
                var matched = false;
                var patterns = spec.states[state];
                for(var i = 0; i < patterns.length; ++i) {
                    var pattern = patterns[i];
                    var matches = pattern.regex.exec(line_str.substring(start));
                    lexer.dir(matches);
                    if(matches) {
                        var match = matches[1] || matches[0];
                        if('type' in pattern) {
                            tokens.push({
                                type: pattern.type,
                                val: match,
                                line: line_num+1
                            });
                        }
                        if('next_state' in pattern) {
                            state = pattern.next_state;
                        }
                        matched = true;
                        start += matches[0].length;
                        break;
                    }
                }
                if(!matched)
                    throw new Error('No pattern matched on line ' + (line_num+1) +
                                    ', character ' + start);
                lexer.log('end: ' + start);
                lexer.log('state: ' + state);
            }
        });

        return tokens;
    };

    return lexer;
})(lexer || {});
