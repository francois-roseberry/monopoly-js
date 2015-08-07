(function() {
	"use strict";
	
	exports.SQUARES = [
		go(), estate(0), communityChest(), estate(0), incomeTax(),
		railroad(), estate(1), chance(), estate(1), estate(1),
		
		jail(), estate(2), company(), estate(2), estate(2),
		railroad(), estate(3), communityChest(), estate(3), estate(3),
		
		parking(), estate(4), chance(), estate(4), estate(4),
		railroad(), estate(5), estate(5), company(), estate(5),
		
		goToJail(), estate(6), estate(6), communityChest(), estate(6),
		railroad(), chance(), estate(7), luxuryTax(), estate(7)
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
		return { type: 'railroad' };
	}
	
	function estate(group) {
		return { type: 'estate', property: { group: group } };
	}
}());