// lc2editor.js - an editor for LC-2 assembly
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
        var subs = {
            '\n' : '\\n',
            '\t' : '\\t'
        };
        var ab = String.fromCharCode((av << 4) + bv);
        var cd = String.fromCharCode((cv << 4) + dv);
        if(ab in subs) ab = subs[ab];
        if(cd in subs) cd = subs[cd];
        line += ab + cd;
        return line;
    }

    function makeMarker() {
        var marker = document.createElement("div");
        marker.style.color = "#f00";
        marker.innerHTML = "X";
        return marker;
    }
    
    LC2.editorFromTextArea = function(ta) {
        var errorLine = -1;
        var ed = {};
        ed.CM = CodeMirror.fromTextArea(ta,{
            lineNumbers: true,
            mode: 'text/x-z80',
            gutters: ["CodeMirror-linenumbers", "error"]
        });
        ed.CM.on('change', function(cm, change) {
            if(errorLine > -1) {
                cm.getDoc().setGutterMarker(errorLine, 'error', null);
            }
            if(ed.onChange) {
                ed.onChange(change);
            }
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
                if(ed.bytesCM) {
                    var str = '';
                    for(let key in output) {
                        str += bytesToString(output[key]) + '\n';
                    }
                    ed.bytesCM.getDoc().setValue(str.substring(0,str.length-1));
                    ed.bytesCM.setOption('firstLineNumber',
                                         parseInt(Object.keys(output)[0], 10));
                }
            } catch(err) {
                errorLine = err.line - 1;
                ed.CM.getDoc().setGutterMarker(errorLine, 'error', makeMarker());
                console.error(err.message + ' on line ' + err.line);
                if(ed.onError) {ed.onError(err);}
                if(ed.bytesCM) {
                    ed.bytesCM.getDoc().setValue('');
                }
            }
        };
        ed.setValue = function(str) {
            ed.CM.getDoc().setValue(str);
        };
        return ed;
    };
    return LC2;
})(LC2 || {});
