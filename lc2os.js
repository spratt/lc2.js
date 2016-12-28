// lc2os.js - loads LC2 OS
//
// Author:  Simon Pratt
// License: ISC
// Website: http://blog.pr4tt.com/lc2.js/

var LC2 = (function(LC2, undefined) {
    LC2.loadOS = function(lc2inst) {
        try {
            var traps = LC2.assemble(lib.readFromURL('asm/traps.asm'));
            lc2inst.load_program(traps);
            var getc_prg = LC2.assemble(lib.readFromURL('asm/getc.asm'));
            lc2inst.load_program(getc_prg);
            var out_prg = LC2.assemble(lib.readFromURL('asm/out.asm'));
            lc2inst.load_program(out_prg);
            var puts_prg = LC2.assemble(lib.readFromURL('asm/puts.asm'));
            lc2inst.load_program(puts_prg);
            var in_prg = LC2.assemble(lib.readFromURL('asm/in.asm'));
            lc2inst.load_program(in_prg);
            var halt_prg = LC2.assemble(lib.readFromURL('asm/halt.asm'));
            lc2inst.load_program(halt_prg);
        } catch(err) {
            console.error('Error while loading service routines', err);
        }
    };
    return LC2;
})(LC2 || {});
