// lc2display.js - displays LC-2 state in-browser
//
// Author:  Simon Pratt
// License: ISC
// Website: http://blog.pr4tt.com/lc2.js/

var LC2 = (function(LC2, undefined) {
    const DEFAULT_PAGE = 24;
    
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
    LC2.prototype.displayFromDiv = function(div) {
        var lc2inst = this;
        var display = {};
        // REGISTERS
        var registerInputs = [];
        for(let i = 0; i < LC2.REGISTERS; ++i) {
            var regDiv = document.createElement('div');
            var label = document.createElement('span');
            label.innerHTML = 'r' + i + ':';
            regDiv.appendChild(label);
            var input = document.createElement('input');
            registerInputs.push(input);
            regDiv.appendChild(input);
            div.appendChild(regDiv);
        }
        function updateRegisters() {
            for(let i = 0; i < LC2.REGISTERS; ++i) {
                registerInputs[i].value = lc2inst.r[i].val;
            }
        }
        // MEMORY
        var pageLabel = document.createElement('span');
        pageLabel.innerHTML = 'Page: ';
        div.appendChild(pageLabel);
        var pageSelect = document.createElement('select');
        for(let i = 0; i <= LC2.ones(LC2.PAGE_BITS); ++i) {
            var opt = document.createElement('option');
            opt.value = i;
            if(i === DEFAULT_PAGE) opt.selected = true;
            opt.innerHTML = i;
            pageSelect.appendChild(opt);
        }
        div.appendChild(pageSelect);
        var stepButton = document.createElement('button');
        stepButton.innerHTML = 'Step';
        div.appendChild(stepButton);
        var memoryTextArea = document.createElement('textarea');
        div.appendChild(memoryTextArea);
        display.memoryCM = CodeMirror.fromTextArea(memoryTextArea, {
            lineNumbers: true,
            readOnly: true,
            lineNumberFormatter: numToHex
        });
        function updateMemory() {
            var page = pageSelect.options[pageSelect.selectedIndex].value;
            display.memoryCM.getDoc().setValue(lc2inst.mem.getPage(page));
            display.memoryCM.setOption('firstLineNumber',
                                       (page << LC2.PAGE_LOCS));
        }
        pageSelect.addEventListener('change', updateMemory);
        display.update = function() {
            updateMemory();
            updateRegisters();
        };
        stepButton.addEventListener('click',function() {
            lc2inst.run_cycle();
            display.update();
        });
        return display;
    };
    return LC2;
})(LC2 || {});
