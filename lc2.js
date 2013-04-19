// lc2.js - an implementation of the LC-2 processor in Javascript
//
// Written by: Simon Pratt
// Licensed under: The ISC License
//
// The LC-2 processor is described in the book "Introduction to
// Computing Systems: from Bits & Gates to C & Beyond" by Yale N. Patt,
// and Sanjay J. Patel

var LC2 = (function(LC2) {
	var ProtoLC2 = {};

	var Register = function(value) {
		if(!value) var value = 0;
		
		this.set = function(new_value) {
			value = new_value;
		}

		this.get = function() {
			return value;
		}
	};

	var initialize_registers = function(lc2_inst) {
		for(var i = 0; i < 16; ++i) {
			lc2_inst.reg[i] = new Register(0);
		}
	};

	// initialization
	var LC2 = function() {
		this.mem = [];
		this.reg = [];
		this.pc = new Register(0);
		initialize_registers(this);
	};

	// inheritance
	LC2.prototype = ProtoLC2;
	return LC2;
}(LC2 || {}));