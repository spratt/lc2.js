test("instantiate LC2 object", function() {
	ok( new LC2 );
});

test("instantiated LC2 object has expected attributes", function() {
	var lc2 = new LC2;
	
	equal( lc2.debug, false );
	equal( lc2.conds, 0 );
	ok( lc2.pc );
	equal( lc2.pc.val, 0 );
	ok( lc2.ir );
	equal( lc2.ir.val, 0 );
	ok( lc2.mem );
	ok( lc2.mem.mar );
	equal( lc2.mem.mar.val, 0 );
	ok( lc2.mem.mdr );
	equal( lc2.mem.mdr.val, 0 );
	ok( lc2.r );
	ok( lc2.r[7] );
	equal( lc2.r[7].val, 0 );
});

test("set and get value of registers", function() {
	var lc2 = new LC2;

	// set
	for(var i = 0; i <= 7; ++i) {
		lc2.r[i].val = i+1;
	}
	lc2.pc.val = 9;
	lc2.ir.val = 10;

	// get
	for(var i = 0; i <= 7; ++i) {
		equal( lc2.r[i].val, i + 1 );
	}
	equal( lc2.pc.val, 9 );
	equal( lc2.ir.val, 10 );
});

test("write and read from memory", function() {
	var lc2 = new LC2;

	lc2.mem.mar.val = 3000;
	equal( lc2.mem.mar.val, 3000 );
	
	lc2.mem.mdr.val = 8;
	equal( lc2.mem.mdr.val, 8 );
	lc2.mem.interrogate(1);  // write 8 to memory location 3000
	
	lc2.mem.mar.val = 3001;
	lc2.mem.mdr.val = 42;
	lc2.mem.interrogate(1);  // write 42 to memory location 3001
	
	lc2.mem.mar.val = 3000;
	lc2.mem.interrogate();
	equal( lc2.mem.mdr.val, 8 );

	lc2.mem.mar.val = 3001;
	lc2.mem.interrogate();
	equal( lc2.mem.mdr.val, 42 );
});

test("test add method", function() {
	var lc2 = new LC2;

	equal( lc2.r[0].val, 0 );
	
	lc2.add(0,0,1,10);             // r0[0]  = r0[0]  + 10     = 10
	equal( lc2.r[0].val, 10 );
	
	lc2.add(0,0,1,10);             // r0[10] = r0[10] + 10     = 20
	equal( lc2.r[0].val, 20 );
	
	lc2.add(1,1,1,11);             // r1[0]  = r1[0]  + 11     = 11
	equal( lc2.r[1].val, 11 );
	
	lc2.add(1,1,1,11);             // r1[11] = r1[11] + 11     = 22
	equal( lc2.r[1].val, 22 );
	
	lc2.add(2,0,0,1);              // r2[0]  = r0[20] + r1[22] = 42
	equal( lc2.r[2].val, 42 );
});

test("test run_cycle method on add instructions", function() {
	var lc2 = new LC2;
	
	lc2.pc.val = 3000;
	lc2.mem.mar.val = 3000;
	lc2.mem.mdr.val = parseInt('0001001010100101',2); // add(1,2,1,5)
	lc2.mem.interrogate(1);
	lc2.run_cycle();
	equal( lc2.r[1].val, 5    );
	equal( lc2.conds,    2    ); // positive
	equal( lc2.pc.val,   3001 );

	lc2.mem.mar.val = 3001;
	lc2.mem.mdr.val = parseInt('0001111001000001',2); // add(7,1,0,1)
	lc2.mem.interrogate(1);
	lc2.run_cycle();
	equal( lc2.r[7].val, 10   );
	equal( lc2.conds,    2    ); // positive
	equal( lc2.pc.val,   3002 );
});

test("test and method", function() {
	var lc2 = new LC2;

	lc2.add(0,0,1,5);              // r0[0]  = r0[0]  + 5     = 5
	lc2.add(1,1,1,3);              // r3[0]  = r3[0]  + 3     = 3
	lc2.and(2,0,0,1);              // r2[0]  = r0[5]  & r1[3] = 1
	equal( lc2.r[2].val, 5 & 3 );  // 1

	lc2.and(2,2,1,0);              // r2[1]  = r2[1]  & 0     = 0
	equal( lc2.r[2].val, 0 );      // 0
});

test("test run_cycle method on and instructions", function() {
	var lc2 = new LC2;

	lc2.pc.val = 3002;
	lc2.mem.mar.val = 3002;
	lc2.mem.mdr.val = parseInt('0101001001100000',2); // and(1,1,1,0)
	lc2.mem.interrogate(1);
	lc2.run_cycle();
	equal( lc2.r[1].val, 0    );
	equal( lc2.conds,    4    ); // zero
	equal( lc2.pc.val,   3003 );

	lc2.mem.mar.val = 3003;
	lc2.mem.mdr.val = parseInt('0101111001000111',2); // and(7,1,0,7)
	lc2.mem.interrogate(1);
	lc2.run_cycle();
	equal( lc2.r[1].val, 0    );
	equal( lc2.conds,    4    ); // zero
	equal( lc2.pc.val,   3004 );
});

test("test not method", function() {
	var lc2 = new LC2;

	lc2.not(1,0);              // r1[0] = ~r1[0] = -1
	equal( lc2.r[1].val, -1 ); // -1
});

test("test run_cycle method on not instruction", function() {
	var lc2 = new LC2;
	lc2.pc.val = 3004;

	lc2.mem.mar.val = 3004;
	lc2.mem.mdr.val = parseInt('1001001001111111',2); // not(1,1);
	lc2.mem.interrogate(1);
	lc2.run_cycle();
	equal( lc2.r[1].val, -1   );
	equal( lc2.conds,    1    ); // negative
	equal( lc2.pc.val,   3005 );
});

test("test lea method", function() {
	var lc2 = new LC2;

	lc2.pc.val = parseInt('4018',16);
	lc2.lea(5,parseInt('1FD',16));

	equal( lc2.r[5].val, parseInt('41FD',16) ); // 4|1FD
});

test("test run_cycle method on lea instruction", function() {
	var lc2 = new LC2;
	
	lc2.pc.val = parseInt('3005',16);
	lc2.mem.mar.val = parseInt('3005',16);
	lc2.mem.mdr.val = parseInt('1110101101010101',2); // lea(5,parseInt('101010101',2))
	lc2.mem.interrogate(1);
	lc2.run_cycle();

	equal( lc2.r[5].val, parseInt('0011000101010101',2) ); // 0000011|101010101
	equal( lc2.conds,    2 ); // positive
	equal( lc2.pc.val,   1 + parseInt('3005',16) );
});

test("test ld method", function() {
	var lc2 = new LC2;

	lc2.mem.mar.val = parseInt('41FD',16);
	lc2.mem.mdr.val = 42;
	lc2.mem.interrogate(1);
	lc2.mem.mdr.val = 0;
	lc2.mem.interrogate();
	equal( lc2.mem.mdr.val, 42 );

	lc2.pc.val = parseInt('4018',16);
	lc2.ld(5,parseInt('1FD',16));
	equal( lc2.r[5].val, 42 );
});

test("test run_cycle method on ld instruction", function() {
	var lc2 = new LC2;
	lc2.pc.val = parseInt('3000',16);

	lc2.mem.mar.val = parseInt('31AF',16);
	lc2.mem.mdr.val = 42;
	lc2.mem.interrogate(1);
	lc2.mem.mdr.val = 0;
	lc2.mem.interrogate();
	equal( lc2.mem.mdr.val, 42 );

	lc2.mem.mar.val = parseInt('3000',16);
	lc2.mem.mdr.val = parseInt('0010010110101111',2); // ld(2,parseInt('1AF',16))
	lc2.mem.interrogate(1);
	lc2.run_cycle();
	equal( lc2.r[2].val, 42 );
	equal( lc2.conds,    2    ); // positive
	equal( lc2.pc.val,   1 + parseInt('3000',16) );
});

test("test st method", function() {
	var lc2 = new LC2;

	lc2.r[5].val = 42;
	lc2.pc.val = parseInt('4018',16);
	lc2.st(5,parseInt('1FD',16));
	lc2.mem.mar.val = parseInt('41FD',16);
	lc2.mem.interrogate();
	equal( lc2.mem.mdr.val, 42 );
});

test("test run_cycle method on st instruction", function() {
	var lc2 = new LC2;
	lc2.pc.val = parseInt('3000',16);

	lc2.r[2].val = 42;

	lc2.mem.mar.val = parseInt('3000',16);
	lc2.mem.mdr.val = parseInt('0011010110101111',2); // st(2,parseInt('1AF',16))
	lc2.mem.interrogate(1);
	lc2.run_cycle();

	lc2.mem.mar.val = parseInt('31AF',16);
	lc2.mem.interrogate();

	equal( lc2.mem.mdr.val, 42 );
	equal( lc2.conds,    2    ); // positive
	equal( lc2.pc.val,   1 + parseInt('3000',16) );
});

test("test ldi method", function() {
	var lc2 = new LC2;

	lc2.mem.mar.val = parseInt('4BCC',16);
	lc2.mem.mdr.val = parseInt('2110',16);
	lc2.mem.interrogate(1);
	lc2.mem.mdr.val = 0;
	lc2.mem.interrogate();
	equal( lc2.mem.mdr.val, parseInt('2110',16) );
	
	lc2.mem.mar.val = parseInt('2110',16);
	lc2.mem.mdr.val = 42;
	lc2.mem.interrogate(1);
	lc2.mem.mdr.val = 0;
	lc2.mem.interrogate();
	equal( lc2.mem.mdr.val, 42 );

	lc2.pc.val = parseInt('4A1B',16);
	lc2.ldi(3,parseInt('1CC',16));
	equal( lc2.r[3].val, 42 );
});

test("test run_cycle method on ldi instruction", function() {
	var lc2 = new LC2;

	lc2.mem.mar.val = parseInt('4BCC',16);
	lc2.mem.mdr.val = parseInt('2110',16);
	lc2.mem.interrogate(1);
	lc2.mem.mdr.val = 0;
	lc2.mem.interrogate();
	equal( lc2.mem.mdr.val, parseInt('2110',16) );
	
	lc2.mem.mar.val = parseInt('2110',16);
	lc2.mem.mdr.val = 42;
	lc2.mem.interrogate(1);
	lc2.mem.mdr.val = 0;
	lc2.mem.interrogate();
	equal( lc2.mem.mdr.val, 42 );

	lc2.pc.val = parseInt('4A1B',16);
	lc2.mem.mar.val = parseInt('4A1B',16);
	lc2.mem.mdr.val = parseInt('1010011111001100',2); // ld(2,parseInt('1CC',16))
	lc2.mem.interrogate(1);
	lc2.run_cycle();
	equal( lc2.r[3].val, 42 );
	equal( lc2.conds,    2    ); // positive
	equal( lc2.pc.val,   1 + parseInt('4A1B',16) );
});

test("test sti method", function() {
	var lc2 = new LC2;

	lc2.r[3].val = 42;
	lc2.mem.mar.val = parseInt('4BCC',16);
	lc2.mem.mdr.val = parseInt('2110',16);
	lc2.mem.interrogate(1);
	lc2.mem.mdr.val = 0;
	lc2.mem.interrogate();
	equal( lc2.mem.mdr.val, parseInt('2110',16) );
	
	lc2.pc.val = parseInt('4A1B',16);
	lc2.sti(3,parseInt('1CC',16));
	lc2.mem.mar.val = parseInt('2110',16);
	lc2.mem.interrogate();
	equal( lc2.mem.mdr.val, 42 );
});

test("test run_cycle method on sti instruction", function() {
	var lc2 = new LC2;

	lc2.r[3].val = 42;
	lc2.mem.mar.val = parseInt('4BCC',16);
	lc2.mem.mdr.val = parseInt('2110',16);
	lc2.mem.interrogate(1);
	lc2.mem.mdr.val = 0;
	lc2.mem.interrogate();
	equal( lc2.mem.mdr.val, parseInt('2110',16) );

	lc2.pc.val = parseInt('4A1B',16);
	lc2.mem.mar.val = parseInt('4A1B',16);
	lc2.mem.mdr.val = parseInt('1011011111001100',2); 	// sti(3,parseInt('1CC',16))
	lc2.mem.interrogate(1);
	lc2.run_cycle();
	lc2.mem.mar.val = parseInt('2110',16);
	lc2.mem.interrogate();
	equal( lc2.mem.mdr.val, 42 );
	equal( lc2.conds,    2    ); // positive
	equal( lc2.pc.val,   1 + parseInt('4A1B',16) );
});

test("test ldr method", function() {
	var lc2 = new LC2;

	lc2.r[2].val = parseInt('2345',16);
	lc2.mem.mar.val = parseInt('2362',16);
	lc2.mem.mdr.val = 42;
	lc2.mem.interrogate(1);
	lc2.mem.mdr.val = 0;
	lc2.mem.interrogate();
	equal( lc2.mem.mdr.val, 42 );

	lc2.ldr(1,2,parseInt('1D',16));
	equal( lc2.r[1].val, 42 );
});

test("test run_cycle method on ldr instruction", function() {
	var lc2 = new LC2;

	lc2.r[2].val = parseInt('2345',16);
	lc2.mem.mar.val = parseInt('2362',16);
	lc2.mem.mdr.val = 42;
	lc2.mem.interrogate(1);
	lc2.mem.mdr.val = 0;
	lc2.mem.interrogate();
	equal( lc2.mem.mdr.val, 42 );

	lc2.pc.val = parseInt('3000',16);
	lc2.mem.mar.val = parseInt('3000',16);
	lc2.mem.mdr.val = parseInt('0110001010011101',2); 	// ldr(1,2,parseInt('1D',16)
	lc2.mem.interrogate(1);
	lc2.run_cycle();
	equal( lc2.r[1].val, 42 );
	equal( lc2.conds,    2    ); // positive
	equal( lc2.pc.val,   1 + parseInt('3000',16) );
});

test("test str method", function() {
	var lc2 = new LC2;

	lc2.r[1].val = 42;
	lc2.r[2].val = parseInt('2345',16);
	lc2.str(1,2,parseInt('1D',16));
	lc2.mem.mar.val = parseInt('2362',16);
	lc2.mem.interrogate();
	equal( lc2.mem.mdr.val, 42 );
});

test("test run_cycle method on str instruction", function() {
	var lc2 = new LC2;

	lc2.r[1].val = 42;
	lc2.r[2].val = parseInt('2345',16);
	lc2.pc.val = parseInt('3000',16);
	lc2.mem.mar.val = parseInt('3000',16);
	lc2.mem.mdr.val = parseInt('0111001010011101',2); 	// str(1,2,parseInt('1D',16)
	lc2.mem.interrogate(1);
	lc2.run_cycle();
	lc2.mem.mar.val = parseInt('2362',16);
	lc2.mem.interrogate();
	equal( lc2.mem.mdr.val, 42 );
	equal( lc2.conds,    2    ); // positive
	equal( lc2.pc.val,   1 + parseInt('3000',16) );
});
