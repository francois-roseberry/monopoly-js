(function() {
	"use strict";
	
	var i18n = require('./i18n');
	var precondition = require('./contract').precondition;
	
	exports.SQUARES = [
		go(),
		estate('med', i18n.PROPERTY_MED, 0, 60),
		communityChest(),
		estate('baltic', i18n.PROPERTY_BALTIC, 0, 60),
		incomeTax(),
		railroad(i18n.RAILROAD_READING),
		estate('east', i18n.PROPERTY_EAST, 1, 100),
		chance(),
		estate('vt', i18n.PROPERTY_VT, 1, 100),
		estate('conn', i18n.PROPERTY_CONN, 1, 120),
		
		jail(),
		estate('charles', i18n.PROPERTY_CHARLES, 2, 140),
		company('electric', i18n.COMPANY_ELECTRIC),
		estate('us', i18n.PROPERTY_US, 2, 140),
		estate('vn', i18n.PROPERTY_VN, 2, 160),
		railroad(i18n.RAILROAD_PENN),
		estate('jack', i18n.PROPERTY_JACK, 3, 180),
		communityChest(),
		estate('tn', i18n.PROPERTY_TN, 3, 180),
		estate('ny', i18n.PROPERTY_NY, 3, 200),
		
		parking(),
		estate('kt', i18n.PROPERTY_KT, 4, 220),
		chance(),
		estate('in', i18n.PROPERTY_IN, 4, 220),
		estate('il', i18n.PROPERTY_IL, 4, 240),
		railroad(i18n.RAILROAD_B_O),
		estate('at', i18n.PROPERTY_AT, 5, 260),
		estate('vr', i18n.PROPERTY_VR, 5, 260),
		company('water', i18n.COMPANY_WATER),
		estate('marvin', i18n.PROPERTY_MARVIN, 5, 280),
		
		goToJail(),
		estate('pa', i18n.PROPERTY_PA, 6, 300),
		estate('nc', i18n.PROPERTY_NC, 6, 300),
		communityChest(),
		estate('penn', i18n.PROPERTY_PENN, 6, 320),
		railroad(i18n.RAILROAD_SHORT),
		chance(),
		estate('pk', i18n.PROPERTY_PK, 7, 350),
		luxuryTax(),
		estate('bw', i18n.PROPERTY_BW, 7, 400)
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
				visitor['community-chest'](i18n.COMMUNITY_CHEST);
			}};
	}
	
	function chance() {
		return {
			match: function (visitor) {
				visitor['chance'](i18n.CHANCE);
			}};
	}
	
	function incomeTax() {
		return {
			match: function (visitor) {
				visitor['income-tax'](i18n.INCOME_TAX);
			}};
	}
	
	function luxuryTax() {
		return {
			match: function (visitor) {
				visitor['luxury-tax'](i18n.LUXURY_TAX);
			}};
	}
	
	function company(id, name) {
		precondition(_.isString(id), 'Company must have an id');
		precondition(_.isString(name), 'Company must have a name');
		
		return {
			match: function (visitor) {
				visitor['company'](id, name, 150);
			}};
	}
	
	function railroad(name) {
		precondition(_.isString(name), 'Railroad must have a name');
		
		return {
			match: function (visitor) {
				visitor['railroad'](name, 200);
			}};
	}
	
	function estate(id, name, group, price) {
		precondition(_.isString(id), 'Property must have an id');
		precondition(_.isString(name), 'Property must have a name');
		precondition(_.isNumber(group), 'Property must have a group');
		precondition(_.isNumber(price), 'Property must have a price');
		
		return {
			match: function (visitor) {
				visitor['estate'](id, name, group, price);
			}};
	}
}());