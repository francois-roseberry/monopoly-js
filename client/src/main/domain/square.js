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
		return {
			match: function (visitor) {
				visitor['go']();
			}};
	}
	
	function jail() {
		return {
			match: function (visitor) {
				visitor['jail']();
			}};
	}
	
	function parking() {
		return {
			match: function (visitor) {
				visitor['parking']();
			}};
	}
	
	function goToJail() {
		return {
			match: function (visitor) {
				visitor['go-to-jail']();
			}};
	}
	
	function communityChest() {
		return {
			match: function (visitor) {
				visitor['community-chest']();
			}};
	}
	
	function chance() {
		return {
			match: function (visitor) {
				visitor['chance']();
			}};
	}
	
	function incomeTax() {
		return {
			match: function (visitor) {
				visitor['income-tax']();
			}};
	}
	
	function luxuryTax() {
		return {
			match: function (visitor) {
				visitor['luxury-tax']();
			}};
	}
	
	function company() {
		return {
			match: function (visitor) {
				visitor['company']();
			}};
	}
	
	function railroad() {
		return {
			match: function (visitor) {
				visitor['railroad']();
			}};
	}
	
	function estate(group) {
		return {
			match: function (visitor) {
				visitor['estate'](group);
			}};
	}
}());