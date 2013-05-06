// lc2.js - a simulator of the LC-2 processor in Javascript
//
// Author:  Simon Pratt
// License: ISC
// Website: http://spratt.github.io/lc2.js/

var LC2 = (function(LC2, undefined) {
	// constants
	var BASE = 2;
	var BITS = 16;
	var OPCODE_BITS = 4;
	var PAGE_BITS = 7;
	var PAGE_LOCS = BITS - PAGE_BITS;
	var REGISTERS = 8;

	var COND_NEG  = 1 << 0; // 2^0 = 1
	var COND_POS  = 1 << 1; // 2^1 = 2
	var COND_ZERO = 1 << 2; // 2^2 = 4

	// helpers
	var ones = function(n) {
		// Generate the largest unsigned integer representable in n bits
		var value = 0;
		for(var i = 0; i < n; ++i) {
			value = value | (1 << i);
		}
		return value;
	}

	var toSignedInt = function(n, bits) {
		// Bitwise operators in Javascript coerce the number to a 32 bit integer
		// so this removes the value of the upper 32-n bits to coerce to n bits
		// while maintaining the sign bit
		var shift = 32 - bits;
		return (n << shift) >> shift;
	};
	
	var set_conditions = function(lc2_inst, value) {
		// set the condition bits on the given lc2 whose last result was value
		if(value < 0)
			lc2_inst.conds = COND_NEG;
		else if(value > 0)
			lc2_inst.conds = COND_POS;
		else
			lc2_inst.conds = COND_ZERO;
		lc2_inst.log("conds set to " + lc2_inst.conds);
	};

	var toBinaryString = function(num) {
		if(typeof(num) !== "number") return;
		return (num >> 0).toString(2);
	};

	// classes
	var Register = function(_id) {
		if(!_id)  var _id  = "reg";
		var _val = new Int16Array(1);
		_val[0] = 0;

		this.__defineGetter__("val", function() {
			return _val[0];
		});
		
		this.__defineSetter__("val", function(val) {
			_val[0] = val;
		});

		this.toString = function() {
			return "" + _id + "[" + _val[0] + "]";
		};
	};

	var MemoryUnit = function(lc2_inst) {
		var mar = new Register("mar");
		var mdr = new Register("mdr");
		var pages = [];

		this.log = function() {};
		if(lc2_inst && typeof(lc2_inst.log) === 'function') {
			this.log = function(o) {
				lc2_inst.log(o);
			};
		}
		
		// fake initialize memory
		for(var page = 0; page < Math.pow(BASE, PAGE_BITS); ++page) {
			pages[page] = null;
		}

		
		this.__defineGetter__("mar", function() {
			return mar;
		});

		this.__defineGetter__("mdr", function() {
			return mdr;
		});

		this.interrogate = function(write_bit) {
			// translate 16 bit location to 32 bit location
			var page = (mar.val >> PAGE_LOCS) & ones(PAGE_BITS);
			var addr = mar.val & ones(PAGE_LOCS);

			this.log('interrogate(' + write_bit + ')');
			this.log('mar:          ' + mar.val +
						 ' = ' + toBinaryString(mar.val));
			this.log('mdr:          ' + mdr.val +
						 ' = ' + toBinaryString(mdr.val));
			this.log('page:         ' + page +
						 ' = ' + toBinaryString(page));
			this.log('addr:         ' + addr +
						 ' = ' + toBinaryString(addr));
			this.log('pages.length: ' + pages.length);

			// just in time memory initialization
			if(pages[page] === null) {
				this.log('first time addressing the given page, allocating');
				pages[page] = new Int16Array(Math.pow(2,PAGE_LOCS));
			}

			this.log('page.length:  ' + pages[page].length);
			
			if(write_bit && (write_bit & 1)) { // write
				pages[page][addr] = mdr.val;
			} else {                           // read
				mdr.val = pages[page][addr];
			}
		};
		
	};

	// methods
	var ProtoLC2 = {};
	
	ProtoLC2.add = function(dest_reg, src_reg, imm5_bit, last) {
		dest_reg = dest_reg & ones(3);
		src_reg = src_reg & ones(3);
		imm5_bit = imm5_bit & 1;
		last = last & ones(5);
		
		this.log("add(" + dest_reg + "," + src_reg + "," +
			imm5_bit + "," + last + ")");
		
		var val1 = this.r[src_reg].val;
		if(imm5_bit === 0) {
			last = last & ones(3);
			this.log(this.r[dest_reg] + " = " + this.r[src_reg] + " + " +
					 this.r[last]);
			var val2 = this.r[last].val;
		} else {
			this.log(this.r[dest_reg] + " = " + this.r[src_reg] + " + " +
					 toSignedInt(last, 5));
			var val2 = toSignedInt(last, 5);
		}
		
		var result = val1 + val2;
		this.log(result + " = " + val1 + " + " + val2);
		this.r[dest_reg].val = result;
		set_conditions(this, result);
	};

	ProtoLC2.and = function(dest_reg, src_reg, imm5_bit, last) {
		dest_reg = dest_reg & ones(3);
		src_reg = src_reg & ones(3);
		imm5_bit = imm5_bit & 1;
		last = last & ones(5);
		
		this.log("and(" + dest_reg + "," + src_reg + "," +
			imm5_bit + "," + last + ")");

		var val1 = this.r[src_reg].val;
		if(imm5_bit === 0) {
			last = last & ones(3);
			this.log(this.r[dest_reg] + " = " + this.r[src_reg] + " & " +
					 this.r[last]);
			var val2 = this.r[last].val;
		} else {
			this.log(this.r[dest_reg] + " = " + this.r[src_reg] + " & " +
					 toSignedInt(last, 5));
			var val2 = toSignedInt(last, 5);
		}
		
		var result = val1 & val2;
		this.log(result + " = " + val1 + " & " + val2);
		this.r[dest_reg].val = result;
		set_conditions(this, result);
	};

	ProtoLC2.not = function(dest_reg, src_reg) {
		dest_reg = dest_reg & ones(3);
		src_reg = src_reg & ones(3);
		
		this.log("not(" + dest_reg + "," + src_reg + ")");
		
		var val1 = this.r[src_reg].val;
		
		var result = ~val1;
		this.log(result + " = ~" + val1);
		this.r[dest_reg].val = result;
		set_conditions(this, result);
	};

	ProtoLC2.lea = function(dest_reg, imm) {
		dest_reg = dest_reg & ones(3);
		imm = imm & ones(9);
		
		this.log("lea(" + dest_reg + "," + imm + ")");
		this.log("pc: " + this.pc.val);
		
		var page = this.pc.val & (ones(7) << 9);
		
		var result = page | imm;
		this.log(result + " = " + page + " | " + imm);
		this.r[dest_reg].val = result;
		set_conditions(this, result);
	};

	ProtoLC2.ld = function(dest_reg, dir) {
		dest_reg = dest_reg & ones(3);
		dir = dir & ones(9);
		
		this.log("ld(" + dest_reg + "," + dir + ")");
		this.log("pc: " + this.pc.val);
		
		var page = this.pc.val & (ones(7) << 9);
		
		var addr = page | dir;
		this.log(addr + " = " + page + " | " + dir);
		this.mem.mar.val = addr;
		this.mem.interrogate();
		
		var result = this.mem.mdr.val;
		this.r[dest_reg].val = result;
		set_conditions(this, result);
	};

	ProtoLC2.st = function(src_reg, dir) {
		src_reg = src_reg & ones(3);
		dir = dir & ones(9);
		
		this.log("st(" + src_reg + "," + dir + ")");
		this.log("pc: " + this.pc.val);
		
		var page = this.pc.val & (ones(7) << 9);
		var result = this.r[src_reg].val;
		
		var addr = page | dir;
		this.log(addr + " = " + page + " | " + dir);
		this.mem.mar.val = addr;
		this.mem.mdr.val = result;
		this.mem.interrogate(1);
		set_conditions(this, result);
	};

	ProtoLC2.ldi = function(dest_reg, indir) {
		dest_reg = dest_reg & ones(3);
		indir = indir & ones(9);
		
		this.log("ldi(" + dest_reg + "," + indir + ")");
		this.log("pc: " + this.pc.val);
		
		var page = this.pc.val & (ones(7) << 9);
		
		var addr = page | indir;
		this.log(addr + " = " + page + " | " + indir);
		this.mem.mar.val = addr;
		this.mem.interrogate();
		this.mem.mar.val = this.mem.mdr.val;
		this.mem.interrogate();
		
		var result = this.mem.mdr.val;
		this.r[dest_reg].val = result;
		set_conditions(this, result);
	};

	ProtoLC2.sti = function(src_reg, indir) {
		src_reg = src_reg & ones(3);
		indir = indir & ones(9);
		
		this.log("sti(" + src_reg + "," + indir + ")");
		this.log("pc: " + this.pc.val);
		
		var page = this.pc.val & (ones(7) << 9);
		var result = this.r[src_reg].val;
		
		var addr = page | indir;
		this.log(addr + " = " + page + " | " + indir);
		this.mem.mar.val = addr;
		this.mem.interrogate();
		this.mem.mar.val = this.mem.mdr.val;
		this.mem.mdr.val = result;
		this.mem.interrogate(1);
		set_conditions(this, result);
	};

	ProtoLC2.ldr = function(dest_reg, base_reg, offset) {
		dest_reg = dest_reg & ones(3);
		base_reg = base_reg & ones(3);
		offset = offset & ones(9);
		
		this.log("ldr(" + dest_reg + "," + base_reg + "," + offset + ")");

		var base = this.r[base_reg].val;
		var addr = base + offset;
		this.log(addr + " = " + base + " + " + offset);
		this.mem.mar.val = addr;
		this.mem.interrogate();
		
		var result = this.mem.mdr.val;
		this.r[dest_reg].val = result;
		set_conditions(this, result);
	};

	ProtoLC2.str = function(src_reg, base_reg, offset) {
		src_reg = src_reg & ones(3);
		base_reg = base_reg & ones(3);
		offset = offset & ones(9);
		
		this.log("str(" + src_reg + "," + base_reg + "," + offset + ")");

		var base = this.r[base_reg].val;
		var result = this.r[src_reg].val;
		
		var addr = base + offset;
		this.log(addr + " = " + base + " + " + offset);
		this.mem.mar.val = addr;
		this.mem.mdr.val = result;
		this.mem.interrogate(1);
		set_conditions(this, result);
	};

	ProtoLC2.br = function(n, z, p, offset) {
		n = n & 1;
		z = z & 1;
		p = p & 1;
		offset = offset & ones(9);

		this.log("br(" + n + "," + z + "," + p + "," + offset + ")");
		this.log("pc: " + this.pc.val);

		var conds = this.conds;
		var branch =
			(n && (conds & COND_NEG)) ||
			(z && (conds & COND_ZERO)) ||
			(p && (conds & COND_POS));
		if(!branch) return;
		
		var page = this.pc.val & (ones(7) << 9);
		var addr = page | offset;
		this.log(addr + " = " + page + " | " + offset);
		this.pc.val = addr;
	};

	ProtoLC2.trap = function(vector) {
		vector = vector & ones(8);

		this.log("trap(" + vector + ")");
		this.r[7].val = this.pc.val;
		this.pc.val = vector;
	};

	ProtoLC2.ret = function() {
		this.log("ret()");
		this.pc.val = this.r[7].val;
	};

	ProtoLC2.run_cycle = function() {
		this.log("run_cycle()");
		this.log("pc: " + this.pc.val);
		
		// fetch
		this.mem.mar.val = this.pc.val;
		this.mem.interrogate();
		this.ir.val = this.mem.mdr.val;
		this.pc.val = this.pc.val + 1;
		
		// decode
		var ir = this.ir.val & ones(BITS);
		var code = ir >> (BITS - OPCODE_BITS);
		switch(code) {
		case 0:  // 0000: br
			this.br((ir >> 11) & 1, (ir >> 10) & 1, (ir >> 9) & 1,
					ir & ones(9));
			break;
		case 1:  // 0001: add
			this.add((ir >> 9) & ones(3), (ir >> 6) & ones(3),
					 (ir >> 5) & 1, ir & ones(5));
			break;
		case 2:  // 0010: ld
			this.ld((ir >> 9) & ones(3), ir & ones(9));
			break;
		case 3:  // 0011: st
			this.st((ir >> 9) & ones(3), ir & ones(9));
			break;
		case 4:  // 0100: jsr
			this.log("Opcode " + code + " (jsr) not yet implemented");
			break;
		case 5:  // 0101: and
			this.and((ir >> 9) & ones(3), (ir >> 6) & ones(3),
					 (ir >> 5) & 1, ir & ones(5));
			break;
		case 6:  // 0110: ldr
			this.ldr((ir >> 9) & ones(3), (ir >> 6) & ones(3), ir & ones(6));
			break;
		case 7:  // 0111: str
			this.str((ir >> 9) & ones(3), (ir >> 6) & ones(3), ir & ones(6));
			break;
		case 8: // 1000: rti
			this.log("Opcode " + code + " (rti) not yet implemented");
			break;
		case 9:  // 1001: not
			this.not((ir >> 9) & ones(3), (ir >> 6) & ones(3));
			break;
		case 10: // 1010: ldi
			this.ldi((ir >> 9) & ones(3), ir & ones(9));
			break;
		case 11: // 1011: sti
			this.sti((ir >> 9) & ones(3), ir & ones(9));
			break;
		case 12: // 1100: jsrr
			this.log("Opcode " + code + " (jsrr) not yet implemented");
			break;
		case 13: // 1101: ret
			this.ret();
			break;
		case 14: // 1110: lea
			this.lea((ir >> 9) & ones(3), ir & ones(9));
			break;
		case 15: // 1111: trap
			this.trap(ir & ones(8));
			break;
		default: // Must be invalid
			this.log("Opcode " + code + " invalid");
		}
	};

	ProtoLC2.log = function(o) { if(this.debug) console.log(o); };

	// initialization
	var LC2 = function() {
		this.debug = false;
		var conds = COND_ZERO;
		var pc = new Register("pc");
		var ir = new Register("ir");
		var mem = new MemoryUnit(this);
		var reg = [];

		this.__defineGetter__("conds", function() {
			return conds;
		});
		this.__defineSetter__("conds", function(val) {
			conds = val & ones(3);
		});

		this.__defineGetter__("pc", function() {
			return pc;
		});

		this.__defineGetter__("ir", function() {
			return ir;
		});

		this.__defineGetter__("mem", function() {
			return mem;
		});
		
		// initialize registers
		for(var i = 0; i < REGISTERS; ++i) {
			reg[i] = new Register("r" + i);
		}

		this.__defineGetter__("r", function() {
			// copy to prevent access to original array
			return reg.slice(0); 
		});
	};

	LC2.__defineGetter__("COND_POS",  function() { return COND_POS; });
	LC2.__defineGetter__("COND_NEG",  function() { return COND_NEG; });
	LC2.__defineGetter__("COND_ZERO", function() { return COND_ZERO; });

	// inheritance
	LC2.prototype = ProtoLC2;
	return LC2;
}(LC2 || {}));
