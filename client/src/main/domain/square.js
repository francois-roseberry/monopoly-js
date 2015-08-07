(function() {
	"use strict";
	
	exports.SQUARES = [
		go(), property(0), communityChest(), property(0), incomeTax(),
		railroad(), property(1), chance(), property(1), property(1)
	];
	
	function go() {
		return {};
	}
	
	function communityChest() {
		return {};
	}
	
	function chance() {
		return {};
	}
	
	function incomeTax() {
		return {};
	}
	
	function railroad() {
		return { property: {} };
	}
	
	function property(group) {
		return { property: { group: group } };
	}
}());