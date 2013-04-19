// lc2.js - an implementation of the LC-2 processor in Javascript
//
// Written by: Simon Pratt
// Licensed under: The ISC License
//
// The LC-2 processor is described in the book "Introduction to
// Computing Systems: from Bits & Gates to C & Beyond" by Yale N. Patt,
// and Sanjay J. Patel

var LC2 = (function(LC2) {
	var BASE = 2;
	var BITS = 16;
	var REGISTERS = 16;
	
	var ProtoLC2 = {};

	var Register = function(_val) {
		if(!_val) var _val = 0;

		this.__defineGetter__("value", function(){
			return _val;
		});
		
		this.__defineSetter__("value", function(val){
			_val = val % Math.pow(BASE,BITS);
		});
	};

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

	// initialization
	var LC2 = function() {
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