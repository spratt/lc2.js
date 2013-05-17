// don't change this line
module('lib.js');

test('test lib.readFromURL',function() {
	var str = lib.readFromURL('lib.tests.js');
	var lines = str.split('\n');
	equal(lines[0], "// don't change this line");
});
