// lc2.js - an implementation of the LC-2 processor in Javascript
//
// Written by: Simon Pratt
// Licensed under: The ISC License
//
// The LC-2 processor is described in the book "Introduction to
// Computing Systems: from Bits & Gates to C & Beyond" by Yale N. Patt,
// and Sanjay J. Patel

var LC2 = (function(LC2) {
	// constants
	var BASE = 2;
	var BITS = 16;
	var REGISTERS = 16;

	var COND_NEG  = 1 << 0; // 2^0 = 1
	var COND_POS  = 1 << 1; // 2^1 = 2
	var COND_ZERO = 1 << 2; // 2^2 = 4

	// register class
	var Register = function(_val) {
		if(!_val) var _val = 0;

		this.__defineGetter__("value", function(){
			return _val;
		});
		
		this.__defineSetter__("value", function(val){
			_val = val & ones(BITS);
		});

		this.toString = function() {
			return "reg[" + _val + "]";
		};
	};

	// helpers
	var log = function(o) {
		console.log(o);
	};
	
	var ones = function(n) {
		var value = 0;
		for(var i = 0; i < n; ++i) {
			value = value | (1 << i);
		}
		return value;
	}
	
	var set_conditions = function(lc2_inst, value) {
		if(value < 0)
			lc2_inst.conds = COND_NEG;
		else if(value > 0)
			lc2_inst.conds = COND_POS;
		else
			lc2_inst.conds = COND_ZERO;
		log("conds set to " + lc2_inst.conds);
	};

	var add_reg_to_reg = function(lc2_inst,dest_reg,src_reg1,src_reg2) {
		var val1 = lc2_inst.reg[src_reg1].value;
		var val2 = lc2_inst.reg[src_reg2].value;
		var result = val1 + val2;
		log(val1 + " + " + val2 + " = " + result);
		lc2_inst.reg[dest_reg].value = result;
		set_conditions(lc2_inst,result);
	};

	var add_reg_to_imm5 = function(lc2_inst,dest_reg,src_reg1,imm5) {
		var val1 = lc2_inst.reg[src_reg1].value;
		var val2 = imm5 & ones(5);
		var result = val1 + val2;
		log(val1 + " + " + val2 + " = " + result);
		lc2_inst.reg[dest_reg].value = result;
		set_conditions(lc2_inst,result);
	};

	// methods
	var ProtoLC2 = {};
	
	ProtoLC2.add = function(dest_reg,src_reg1,imm5_bit,last) {
		log("add(" + dest_reg + "," + src_reg1 + "," +
			imm5_bit + "," + last + ")");
		if(imm5_bit === 0)
			add_reg_to_reg(this,dest_reg,src_reg1,last);
		else if(imm5_bit === 1)
			add_reg_to_imm5(this,dest_reg,src_reg1,last);
	};

	// initialization
	var initialize_registers = function(lc2_inst) {
		for(var i = 0; i < REGISTERS; ++i) {
			lc2_inst.reg[i] = new Register(0);
		}
	};

	var initialize_memory = function(lc2_inst) {
		for(var i = 0; i < Math.pow(BASE,BITS); ++i) {
			lc2_inst.mem[i] = new Register(0);
		}
	};

	var LC2 = function() {
		this.conds = 0;
		this.mem = [];
		this.reg = [];
		this.pc = new Register(0);
		initialize_registers(this);
		initialize_memory(this);
	};

	// inheritance
	LC2.prototype = ProtoLC2;
	return LC2;
}(LC2 || {}));