// lc2.js - a simulator of the LC-2 processor in Javascript
//
// Author:  Simon Pratt
// License: ISC
// Website: http://blog.pr4tt.com/lc2.js/

var LC2 = (function(LC2, undefined) {
    function numToHex(n) { return (n >> 0).toString(16); }
    function bytesToString(n) {
        var bits = (n >> 0).toString(2);
        while(bits.length < 16)
            bits = '0' + bits;
        var a = bits.substring(0,4);
        var b = bits.substring(4,8);
        var c = bits.substring(8,12);
        var d = bits.substring(12,16);
        var line = `${a} ${b} ${c} ${d}    `;
        var av = parseInt(a, 2);
        var bv = parseInt(b, 2);
        var cv = parseInt(c, 2);
        var dv = parseInt(d, 2);
        var ah = av.toString(16);
        var bh = bv.toString(16);
        var ch = cv.toString(16);
        var dh = dv.toString(16);
        line += `${ah}${bh}${ch}${dh}    `;
        line += String.fromCharCode((av << 4) + bv, (cv << 4) + dv);
        return line;
    }
    
    LC2.editorFromTextArea = function(ta) {
        var ed = {};
        ed.CM = CodeMirror.fromTextArea(ta,{
            lineNumbers: true,
            mode: 'text/x-z80'
        });
        ed.bytesFromTextArea = function(bta) {
            ed.bytesCM = CodeMirror.fromTextArea(bta, {
                lineNumbers: true,
                readOnly: true,
                lineNumberFormatter: numToHex
            });
        };
        ed.assemble = function() {
            var output;
            try {
                output = LC2.assemble(ed.CM.getDoc().getValue());
            } catch(err) {
                console.error(err);
            }
            if(ed.bytesCM) {
                var str = '';
                for(let key in output) {
                    str += bytesToString(output[key]) + '\n';
                }
                ed.bytesCM.getDoc().setValue(str);
                ed.bytesCM.setOption('firstLineNumber',
                                     parseInt(Object.keys(output)[0], 10));
            }
        };
        ed.setValue = function(str) {
            ed.CM.getDoc().setValue(str);
        };
        return ed;
    };
    return LC2;
})(LC2 || {});
