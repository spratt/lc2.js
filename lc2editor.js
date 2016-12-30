// lc2editor.js - an editor for LC-2 assembly
//
// Author:  Simon Pratt
// License: ISC
// Website: http://blog.pr4tt.com/lc2.js/

var LC2 = (function(LC2, undefined) {

    function errorMarker() {
        var marker = document.createElement("div");
        marker.style.color = "#f00";
        marker.innerHTML = "X";
        return marker;
    }
    
    LC2.editorFromTextArea = function(ta) {
        var errorLine = -1;
        var prevMark = -1;
        var ed = {};
        ed.CM = CodeMirror.fromTextArea(ta,{
            lineNumbers: true,
            mode: 'text/x-lc2',
            gutters: ["CodeMirror-linenumbers", "mark"]
        });
        ed.CM.on('change', function(cm, change) {
            if(errorLine > -1) {
                cm.getDoc().setGutterMarker(errorLine, 'mark', null);
            }
            if(ed.onChange) {
                ed.onChange(change, ed.CM.getDoc().getValue());
            }
        });
        ed.assemble = function(meta, handleProgram) {
            try {
                var prg = LC2.assemble(ed.CM.getDoc().getValue(), meta);
                if(handleProgram && (typeof handleProgram) === 'function')
                    handleProgram(prg);
            } catch(err) {
                console.error(err);
                errorLine = err.line - 1;
                ed.CM.getDoc().setGutterMarker(errorLine, 'mark', errorMarker());
                console.error(err.message + ' on line ' + err.line);
                if(ed.onError) {ed.onError(err);}
            }
        };
        ed.setMarker = function(line, marker) {
            if(prevMark > 0) ed.clearMarker();
            ed.CM.getDoc().setGutterMarker(line, 'mark', marker);
            prevMark = line;
        };
        ed.setCursor = function(line) {
            ed.CM.setCursor(line);
        };
        ed.clearMarker = function(line) {
            if(!line) line = prevMark;
            ed.CM.getDoc().setGutterMarker(line, 'mark', null);
        };
        ed.setValue = function(str) {
            ed.CM.getDoc().setValue(str);
        };
        return ed;
    };
    return LC2;
})(LC2 || {});
