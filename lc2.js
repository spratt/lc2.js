// lc2.js - a simulator of the LC-2 processor in Javascript
//
// Author:  Simon Pratt
// License: ISC
// Website: http://spratt.github.io/lc2.js/

var LC2 = (function(LC2) {
	// constants
	var BASE = 2;
	var BITS = 16;
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
		// so this removes the value of the upper 16 bits to coerce to 16 bits
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

	// register class
	var Register = function(_val) {
		if(!_val) var _val = 0;

		this.__defineGetter__("value", function(){
			return _val;
		});
		
		this.__defineSetter__("value", function(val){
			_val = toSignedInt(val,BITS);
		});

		this.toString = function() {
			return "reg[" + _val + "]";
		};
	};

	// methods
	var ProtoLC2 = {};
	
	ProtoLC2.add = function(dest_reg,src_reg,imm5_bit,last) {
		this.log("add(" + dest_reg + "," + src_reg + "," +
			imm5_bit + "," + last + ")");
		var val1 = this.reg[src_reg].value;
		var val2;
		if((imm5_bit & 1) === 0) {
			val2 = this.reg[last].value;
		} else {
			val2 = toSignedInt(last,5);
		} 
		var result = val1 + val2;
		this.log(val1 + " + " + val2 + " = " + result);
		this.reg[dest_reg].value = result;
		set_conditions(this,result);
	};

	ProtoLC2.log = function(o) { if(this.debug) console.log(o); };

	// initialization
	var LC2 = function() {
		this.debug = false;
		this.conds = 0;
		this.mem = [];
		this.reg = [];
		this.pc = new Register(0);
		// initialize registers
		for(var i = 0; i < REGISTERS; ++i) {
			this.reg[i] = new Register(0);
		}
		// initialize memory
		for(var i = 0; i < Math.pow(BASE,BITS); ++i) {
			this.mem[i] = new Register(0);
		}
	};

	// inheritance
	LC2.prototype = ProtoLC2;
	return LC2;
}(LC2 || {}));
