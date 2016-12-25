// lc2editor.js - an editor for LC-2 assembly
//
// Author:  Simon Pratt
// License: ISC
// Website: http://blog.pr4tt.com/lc2.js/

var LC2 = (function(LC2, undefined) {

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
            mode: 'text/x-lc2',
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
        ed.assemble = function(handleProgram) {
            try {
                var output = LC2.assemble(ed.CM.getDoc().getValue());
                if(handleProgram && (typeof handleProgram) === 'function')
                    handleProgram(output);
            } catch(err) {
                console.error(err);
                errorLine = err.line - 1;
                ed.CM.getDoc().setGutterMarker(errorLine, 'error', makeMarker());
                console.error(err.message + ' on line ' + err.line);
                if(ed.onError) {ed.onError(err);}
            }
        };
        ed.setValue = function(str) {
            ed.CM.getDoc().setValue(str);
        };
        return ed;
    };
    return LC2;
})(LC2 || {});
