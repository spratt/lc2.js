// lc2mode.js, copyright (c) by Simon Pratt

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function(mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function(CodeMirror) {
    "use strict";

    // Modified from the sample simplemode
    CodeMirror.defineSimpleMode("lc2", {
        // The start state contains the rules that are intially used
        start: [
            // The regex matches the token, the token property contains the type
            {regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string"},
            // Rules are matched in the order in which they appear, so there is
            // no ambiguity between this one and the one above
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

});
