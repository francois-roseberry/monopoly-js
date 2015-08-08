(function() {
	"use strict";
	
	exports.SQUARES = [
		go(), estate('med', 0, 60), communityChest(), estate('baltic', 0, 60), incomeTax(),
		railroad('reading'), estate('east', 1, 100), chance(), estate('vt', 1, 100), estate('conn', 1, 120),
		
		jail(), estate('charles', 2, 140), company('electric'), estate('us', 2, 140), estate('vn', 2, 160),
		railroad('penn'), estate('jack', 3, 180), communityChest(), estate('tn', 3, 180), estate('ny', 3, 200),
		
		parking(), estate('kt', 4, 220), chance(), estate('in', 4, 220), estate('il', 4, 240),
		railroad('b-o'), estate('at', 5, 260), estate('vr', 5, 260), company('water'), estate('marvin', 5, 280),
		
		goToJail(), estate('pa', 6, 300), estate('nc', 6, 300), communityChest(), estate('penn', 6, 320),
		railroad('short'), chance(), estate('pk', 7, 350), luxuryTax(), estate('bw', 7, 400)
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
	
	function company(id) {
		return {
			match: function (visitor) {
				visitor['company'](id, 150);
			}};
	}
	
	function railroad(id) {
		return {
			match: function (visitor) {
				visitor['railroad'](id, 200);
			}};
	}
	
	function estate(id, group, price) {
		return {
			match: function (visitor) {
				visitor['estate'](id, group, price);
			}};
	}
}());