(function() {
    var lc2inst = new LC2;
    var display;
    var file_cache = {};
    var loader = document.getElementById('loader');
    var errors = document.getElementById('errors');
    var assembleBtn = document.getElementById('assemble');
    var displayDiv = document.getElementById('lc2');
    var codeFollowPC = document.getElementById('codeFollowPC');

    function getPath() {
        return loader.options[loader.selectedIndex].value;
    }

    var editor = LC2.editorFromTextArea(document.getElementById('editor'));
    editor.onError = function(err) {
        errors.innerHTML = err.message + ' on line ' + err.line;
    };
    editor.onChange = function(change, value) {
        errors.innerHTML = '&nbsp;';
        file_cache[getPath()] = value;
    };
    function loadFile(filename) {
        for(let i = 0; i < loader.options.length; ++i) {
            var option = loader.options[i];
            if(option.value === filename)
                loader.selectedIndex = i;
        }
        loaderChange();
    }
    function reset() {
        displayDiv.innerHTML = '';
        lc2inst.reset();
        lc2inst.pc.val = parseInt('3000', 16);
        display = lc2inst.displayFromDiv(displayDiv);
        display.onUpdate = function() {
            var file_info = lc2inst.map[lc2inst.pc.uval];
            if(file_info && codeFollowPC.checked) {
                if(file_info && file_info.filename !== getPath()) {
                    loadFile(file_info.filename);
                }
                editor.setMarker(file_info.line - 1, LC2.pcMarker());
                editor.setCursor(file_info.line - 1);
            } else if(file_info && file_info.filename === getPath()) {
                editor.setMarker(file_info.line - 1, LC2.pcMarker());
            } else {
                editor.clearMarker();
            }
        };
        display.update();
    }
    
    function assemble(){
        reset();
        LC2.loadOS(lc2inst, file_cache);
        var meta = {filename: getPath()};
        editor.assemble(meta, function(prg) {
            lc2inst.load_program(prg, meta);
            display.update();
        });
    }
    assembleBtn.addEventListener('click',assemble);

    function loaderChange(fn) {
        var path = getPath();
        if(!(path in file_cache)) {
            lib.readFromURL(path, function(file) {
                file_cache[path] = file;
                editor.setValue(file_cache[path]);
                if(fn) fn();
            });
        } else {
            editor.setValue(file_cache[path]);
        }
    }
    loaderChange(assemble);
    loader.addEventListener('change', loaderChange);
})();
