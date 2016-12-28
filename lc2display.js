// lc2display.js - displays LC-2 state in-browser
//
// Author:  Simon Pratt
// License: ISC
// Website: http://blog.pr4tt.com/lc2.js/

var LC2 = (function(LC2, undefined) {
    const DEFAULT_PAGE = 24;
    const RUN_MS = 10;
    
    function numToHex(n) { return (n >> 0).toString(16); }

    function addrOnPage(addr, page) {
        var addrPage = (addr >> LC2.PAGE_LOCS);
        return addrPage === page;
    }

    function makeMarker() {
        var marker = document.createElement("div");
        marker.style.color = "#0a0";
        marker.innerHTML = "▶";
        return marker;
    }
    LC2.prototype.displayFromDiv = function(div) {
        var lc2inst = this;
        var display = {};
        display.lastOffset = -1;
        // REGISTERS
        var registerInputs = [];

        // General-Purpose
        var gpRegSpan = document.createElement('span');
        for(let i = 0; i < LC2.REGISTERS; ++i) {
            var regDiv = document.createElement('div');
            var label = document.createElement('span');
            label.innerHTML = 'r' + i + ' ';
            regDiv.appendChild(label);
            var input = document.createElement('input');
            input.type = 'text';
            input.size = 6;
            input.setAttribute('readonly', 'readonly');
            registerInputs.push(input);
            regDiv.appendChild(input);
            gpRegSpan.appendChild(regDiv);
        }
        gpRegSpan.style = 'float: left';
        div.appendChild(gpRegSpan);

        // Special-Purpose
        var spRegs = { 'pc' : null, 'ir' : null };
        var spRegSpan = document.createElement('span');
        for(let reg in spRegs) {
            var regDiv = document.createElement('div');
            var label = document.createElement('span');
            label.innerHTML = reg + ' ';
            regDiv.appendChild(label);
            var input = document.createElement('input');
            input.type = 'text';
            input.size = 6;
            input.setAttribute('readonly', 'readonly');
            spRegs[reg] = input;
            regDiv.appendChild(input);
            spRegSpan.appendChild(regDiv);            
        }

        // Conditions
        var nDiv = document.createElement('div');
        var nLabel = document.createElement('span');
        nLabel.innerHTML = 'N ';
        nDiv.appendChild(nLabel);
        var nInput = document.createElement('input');
        nInput.type = 'text';
        nInput.size = 6;
        nInput.setAttribute('readonly', 'readonly');
        nDiv.appendChild(nInput);
        spRegSpan.appendChild(nDiv);

        var zDiv = document.createElement('div');
        var zLabel = document.createElement('span');
        zLabel.innerHTML = 'Z ';
        zDiv.appendChild(zLabel);
        var zInput = document.createElement('input');
        zInput.type = 'text';
        zInput.size = 6;
        zInput.setAttribute('readonly', 'readonly');
        zDiv.appendChild(zInput);
        spRegSpan.appendChild(zDiv);

        var pDiv = document.createElement('div');
        var pLabel = document.createElement('span');
        pLabel.innerHTML = 'P ';
        pDiv.appendChild(pLabel);
        var pInput = document.createElement('input');
        pInput.type = 'text';
        pInput.size = 6;
        pInput.setAttribute('readonly', 'readonly');
        pDiv.appendChild(pInput);
        spRegSpan.appendChild(pDiv);

        // Memory registers
        var memRegs = { 'mar' : null, 'mdr' : null };
        for(let reg in memRegs) {
            var regDiv = document.createElement('div');
            var label = document.createElement('span');
            label.innerHTML = reg + ' ';
            regDiv.appendChild(label);
            var input = document.createElement('input');
            input.type = 'text';
            input.size = 6;
            input.setAttribute('readonly', 'readonly');
            memRegs[reg] = input;
            regDiv.appendChild(input);
            spRegSpan.appendChild(regDiv);            
        }
        spRegSpan.style = 'float: left; margin-left: 1em; text-align: right;';
        div.appendChild(spRegSpan);
        
        function updateRegisters() {
            for(let i = 0; i < LC2.REGISTERS; ++i) {
                registerInputs[i].value = lc2inst.r[i].val.toString(16);
            }
            for(let reg in spRegs) {
                spRegs[reg].value = lc2inst[reg].uval.toString(16);
            }
            nInput.value = (lc2inst.conds & LC2.COND_NEG) > 0 ? 1 : 0;
            zInput.value = (lc2inst.conds & LC2.COND_ZERO) > 0 ? 1 : 0;
            pInput.value = (lc2inst.conds & LC2.COND_POS) > 0 ? 1 : 0;
            for(let reg in memRegs) {
                memRegs[reg].value = lc2inst.mem[reg].uval.toString(16);
            }
            return lc2inst.pc.val;
        }

        // CONSOLE
        var lc2console = document.createElement('textarea');
        lc2console.style = 'margin-left: 1em; width: 36.6rem; height: 200px;' +
            'resize: none; float: right';
        lc2console.setAttribute('readonly', 'readonly');
        var translations = {
            13 : 10
        };
        lc2console.addEventListener('keypress', function(evt) {
            if(evt.charCode > 0) {
                var key = evt.charCode;
            } else {
                var key = evt.keyCode;
            }
            if(key in translations) {
                key = translations[key];
            }
            lc2inst.set_kbdr(key);
            display.update();
        });
        lc2inst.set_console(function(v) {
            lc2console.append(String.fromCharCode(v));
        });
        div.appendChild(lc2console);
        
        var br = document.createElement('br');
        br.clear = 'all';
        div.appendChild(br);
        
        // MEMORY
        var pageLabel = document.createElement('span');
        pageLabel.innerHTML = 'Memory Page: ';
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
        var followLabel = document.createElement('span');
        followLabel.style = 'margin-left: 5px';
        followLabel.innerHTML = 'Follow PC: ';
        div.appendChild(followLabel);
        var followCheck = document.createElement('input');
        followCheck.type = 'checkbox';
        followCheck.checked = true;
        div.appendChild(followCheck);
        function followChange() {
            if(followCheck.checked) {
                pageSelect.disabled = true;
            } else {
                pageSelect.disabled = false;
            }
        }
        followCheck.addEventListener('change', followChange);
        followChange();
        var stepButton = document.createElement('button');
        stepButton.innerHTML = 'Step';
        stepButton.style = 'float: right';
        div.appendChild(stepButton);
        var runCheck = document.createElement('input');
        runCheck.type = 'checkbox';
        runCheck.style = 'float: right';
        runCheck.checked = true;
        div.appendChild(runCheck);
        var runLabel = document.createElement('span');
        runLabel.style = 'margin-left: 5px; float: right';
        runLabel.innerHTML = 'Run: ';
        div.appendChild(runLabel);
        var memoryTextArea = document.createElement('textarea');
        div.appendChild(memoryTextArea);
        display.memoryCM = CodeMirror.fromTextArea(memoryTextArea, {
            lineNumbers: true,
            readOnly: true,
            lineNumberFormatter: numToHex,
            mode: 'plain/text',
            gutters: ["CodeMirror-linenumbers", "pc"]
        });
        function updateMemory() {
            if(followCheck.checked) {
                var pageNum = (lc2inst.pc.uval >> LC2.PAGE_LOCS);
                pageSelect.selectedIndex = pageNum;
            }
            var page = pageSelect.options[pageSelect.selectedIndex].value;
            display.memoryCM.getDoc().setValue(lc2inst.mem.getPage(page));
            display.memoryCM.setOption('firstLineNumber',
                                       (page << LC2.PAGE_LOCS));
        }
        display.update = function() {
            updateMemory();
            if(display.lastOffset > 0)
                display.memoryCM.getDoc().setGutterMarker(display.lastOffset,
                                                          'pc', null);
            let newPC = updateRegisters();
            var pageStr = pageSelect.options[pageSelect.selectedIndex].value;
            var page = parseInt(pageStr, 10);
            if(addrOnPage(newPC, page)) {
                let fln = display.memoryCM.getOption('firstLineNumber');
                var offset = newPC - fln;
                display.memoryCM.getDoc().setGutterMarker(offset,
                                                          'pc', makeMarker());
                display.memoryCM.setCursor(offset);
                display.lastOffset = offset;
            }
        };
        pageSelect.addEventListener('change', display.update);
        function step() {
            if(lc2inst.halted) {
                return;
            }
            lc2inst.run_cycle();
            display.update();
            if(runCheck.checked) {
                window.setTimeout(step, RUN_MS);
            }
        }
        stepButton.addEventListener('click',step);
        return display;
    };
    return LC2;
})(LC2 || {});
