(function() {
	"use strict";
	
	exports.SQUARES = [
		go(), property(0), communityChest(), property(0), incomeTax(),
		railroad(), property(1), chance(), property(1), property(1),
		
		jail(), property(2), company(), property(2), property(2),
		railroad(), property(3), communityChest(), property(3), property(3),
		
		parking(), property(4), chance(), property(4), property(4),
		railroad(), property(5), property(5), company(), property(5),
		
		goToJail(), property(6), property(6), communityChest(), property(6),
		railroad(), chance(), property(7), luxuryTax(), property(7)
	];
	
	function go() {
		return {};
	}
	
	function jail() {
		return {};
	}
	
	function parking() {
		return {};
	}
	
	function goToJail() {
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
	
	function luxuryTax() {
		return {};
	}
	
	function company() {
		return {};
	}
	
	function railroad() {
		return { property: {} };
	}
	
	function property(group) {
		return { property: { group: group } };
	}
}());