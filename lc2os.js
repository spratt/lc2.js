// lc2os.js - loads LC2 OS
//
// Author:  Simon Pratt
// License: ISC
// Website: http://blog.pr4tt.com/lc2.js/

var LC2 = (function(LC2, undefined) {
    LC2.loadOS = function(lc2inst, file_cache) {
        file_cache = file_cache || {};
        var paths = ['asm/traps.asm', 'asm/getc.asm', 'asm/out.asm',
                     'asm/puts.asm', 'asm/in.asm', 'asm/halt.asm'];
        paths.forEach(function(path) {
            let meta = {filename: path};
            if(path in file_cache) {
                try {
                    var prg = LC2.assemble(file_cache[path], meta);
                    if(prg) lc2inst.load_program(prg, meta);
                } catch(err) {
                    console.error('Error while loading loading OS file:', path);
                }
            } else {
                file_cache[path] = lib.readFromURL(path, function(file){
                    file_cache[path] = file;
                    try {
                        var prg = LC2.assemble(file_cache[path], meta);
                        if(prg) lc2inst.load_program(prg, meta);
                    } catch(err) {
                        console.error('Error while loading OS file:', path);
                    }
                });
            }
        });
    };
    return LC2;
})(LC2 || {});
