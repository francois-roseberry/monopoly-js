(function() {
	"use strict";
	
	exports.SQUARES = [
		go(), property(), communityChest(), property(), incomeTax(),
		railroad(), property(), chance(), property(), property()
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
		return { property: { group: 'railroad' } };
	}
	
	function property() {
		return { property: { group: 'purple' } };
	}
}());