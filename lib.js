// lib.js - a minimalist library for javascript
//
// Author: Simon Pratt
// License: ISC
// Website: http://spratt.github.io/lc2.js/

var lib = (function(lib, undefined) {
	lib.readFromURL = function(url, callback) {
		var req = new XMLHttpRequest;
		var async = false;
		if(callback) {
			async = true;
			req.onreadystatechange = function(e) {
				if(e) throw e;
				callback(req.responseText);
			};
		}
		req.open('GET', url, async);
		req.send();
		if(!callback) return req.responseText;
	};
	return lib;
})(lib || {});