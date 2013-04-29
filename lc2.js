// lc2.js - a simulator of the LC-2 processor in Javascript
//
// Author:  Simon Pratt
// License: ISC
// Website: http://spratt.github.io/lc2.js/

var LC2 = (function(LC2) {
	// constants
	var BASE = 2;
	var BITS = 16;
	var PAGE_BITS = 7;
	var PAGE_LOCS = BITS - PAGE_BITS;
	var REGISTERS = 8;

	var COND_NEG  = 1 << 0; // 2^0 = 1
	var COND_POS  = 1 << 1; // 2^1 = 2
	var COND_ZERO = 1 << 2; // 2^2 = 4

	// helpers
	var assert = function(truth_value) {
		if(!truth_value)
			throw new Error("Assertion failed!");
	};
	
	var ones = function(n) {
		// Generate the largest unsigned integer representable in n bits
		assert(n <= 32);
		assert(n >= 0);
		var value = 0;
		for(var i = 0; i < n; ++i) {
			value = value | (1 << i);
		}
		return value;
	}

	var toSignedInt = function(n,bits) {
		// Bitwise operators in Javascript coerce the number to a 32 bit integer
		// so this removes the value of the upper 32-n bits to coerce to n bits
		assert(bits <= 32);
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
	var Register = function(_id,_val) {
		assert(_id);
		if(!_val) var _val = 0;

		this.__defineGetter__("value", function() {
			return _val;
		});
		
		this.__defineSetter__("value", function(val) {
			// use the least signficant bits, and only as many as the CPU has
			_val = toSignedInt(val,BITS);
		});

		this.toString = function() {
			return "" + _id + "[" + _val + "]";
		};
	};

	var Memory = function(_id,_hval,_lval) {
		assert(_id);
		assert(BITS === 16); // this breaks if not 16 bit
		if(!_hval) var _hval = 0;
		if(!_lval) var _lval = 0;
		var _val = (_hval << BITS) + toSignedInt(_lval,BITS);

		this.__defineGetter__("value", function() {
			return _val;
		});

		this.__defineGetter__("hvalue", function() {
			return (_val & (ones(BITS) << BITS)) >> BITS;
		});

		this.__defineGetter__("lvalue", function() {
			return _val & ones(BITS);
		});
		
		this.__defineSetter__("lvalue", function(val) {
			_val = (_val & (ones(BITS) << BITS)) | toSignedInt(val,BITS);
		});
		
		this.__defineSetter__("hvalue", function(val) {
			_val = (toSignedInt(val,BITS) << BITS) | (_val & ones(BITS));
		});

		this.toString = function() {
			return "" + _id + "[" + _val + "]";
		};
	};

	var MemoryUnit = function(lc2_inst) {
		var mar = new Register("mar",0);
		var mdr = new Register("mdr",0);
		var pages = [];

		this.log = function() {};
		if(lc2_inst && typeof(lc2_inst.log) === 'function') {
			this.log = function(o) {
				lc2_inst.log(o);
			};
		}
		
		// initialize memory
		for(var page = 0; page < Math.pow(BASE,PAGE_BITS); ++page) {
			var this_page = []
			for(var i = 0; i < Math.pow(BASE,PAGE_LOCS); i += 2) {
				var full_addr = (page << PAGE_LOCS) | i;
				this_page[i/2] = new Memory("mem@" + full_addr,0,0);
			}
			pages[page] = this_page;
		}

		
		this.__defineGetter__("mar", function() {
			return mar.value;
		});

		this.__defineSetter__("mar", function(val) {
			mar.value = val;
		});

		this.__defineGetter__("mdr", function() {
			return mdr.value;
		});

		this.__defineSetter__("mdr", function(val) {
			mdr.value = val;
		});

		this.interrogate = function(write_bit) {
			// translate 16 bit location to 32 bit location
			var page = mar.value >> (BITS - PAGE_BITS);
			var addr = (mar.value & ones(PAGE_LOCS)) >> 1;
			var lval = mar.value & 1;

			this.log('interrogate(' + write_bit + ')');
			this.log('mar:          ' + mar.value +
						 ' = ' + toBinaryString(mar.value));
			this.log('mdr:          ' + mdr.value);
			this.log('page:         ' + page +
						 ' = ' + toBinaryString(page));
			this.log('addr:         ' + addr +
						 ' = ' + toBinaryString(addr));
			this.log('lval:         ' + lval);
			this.log('pages.length: ' + pages.length);
			this.log('page.length:  ' + pages[page].length);

			if(write_bit && (write_bit & 1)) { // write
				if(lval) pages[page][addr].lvalue = mdr.value;
				else     pages[page][addr].hvalue = mdr.value;
			} else {                           // read
				if(lval) mdr.value = pages[page][addr].lvalue;
				else     mdr.value = pages[page][addr].hvalue;
			}
		};
		
	};

	// methods
	var ProtoLC2 = {};
	
	ProtoLC2.add = function(dest_reg,src_reg,imm5_bit,last) {
		this.log("add(" + dest_reg + "," + src_reg + "," +
			imm5_bit + "," + last + ")");
		var val1 = this.reg[src_reg].value;
		var val2;
		// check the least significant bit of imm5_bit
		if((imm5_bit & 1) === 0) {
			this.log(this.reg[dest_reg] + " = " + this.reg[src_reg] + " + " +
					 this.reg[last]);
			val2 = this.reg[last].value;
		} else {
			this.log(this.reg[dest_reg] + " = " + this.reg[src_reg] + " + " +
					 toSignedInt(last,5));
			val2 = toSignedInt(last,5);
		} 
		var result = val1 + val2;
		this.log(result + " = " + val1 + " + " + val2);
		this.reg[dest_reg].value = result;
		set_conditions(this,result);
	};

	ProtoLC2.log = function(o) { if(this.debug) console.log(o); };

	// initialization
	var LC2 = function() {
		this.debug = false;
		this.conds = 0;
		this.reg = [];
		this.pc = new Register("pc",0);
		this.ir = new Register("ir",0);
		// initialize registers
		for(var i = 0; i < REGISTERS; ++i) {
			this.reg[i] = new Register("reg"+i,0);
		}
		this.mem = new MemoryUnit(this);
	};

	// inheritance
	LC2.prototype = ProtoLC2;
	return LC2;
}(LC2 || {}));
