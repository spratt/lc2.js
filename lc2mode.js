// lc2mode.js, copyright (c) by Simon Pratt

(function(CodeMirror) {
    "use strict";

    // Modified from the sample simplemode
    CodeMirror.defineSimpleMode("lc2", {
        start: [
            {regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string"},
            {regex: /(?:getc|out|puts|in|halt|add|and|nop|br|brn|brz|brp|brnp|brnz|brzp|brnzp|jmp|jmpr|jsr|jsrr|ld|ldi|ldr|lea|not|ret|rti|st|sti|str|trap)\b/,
             token: "keyword"}, // instructions
            {regex: /\.[^\s]+/, token: "atom"}, // assembly directive
            {regex: /(?:\$|x|X)[a-f\d]+|#?\d+|(?:%|b|B)[01]+/,
             token: "number"},
            {regex: /;.*/, token: "comment"},
            {regex: /(?:r\d|pc|ir)\b/, token: "variable-2"}, // registers
        ]
    });

    CodeMirror.defineMIME("text/x-lc2", "lc2");
    CodeMirror.defineMIME("text/x-lc2", { name: "lc2" });
})(CodeMirror);
