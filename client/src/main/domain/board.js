(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	exports.squares = function () {
		return [
			go(),
			estate('med', i18n.PROPERTY_MED, 0, 60, 2),
			communityChest(),
			estate('baltic', i18n.PROPERTY_BALTIC, 0, 60, 4),
			incomeTax(),
			railroad('rr-reading', i18n.RAILROAD_READING),
			estate('east', i18n.PROPERTY_EAST, 1, 100, 6),
			chance(),
			estate('vt', i18n.PROPERTY_VT, 1, 100, 6),
			estate('conn', i18n.PROPERTY_CONN, 1, 120, 8),
			
			jail(),
			estate('charles', i18n.PROPERTY_CHARLES, 2, 140, 10),
			company('electric', i18n.COMPANY_ELECTRIC),
			estate('us', i18n.PROPERTY_US, 2, 140, 10),
			estate('vn', i18n.PROPERTY_VN, 2, 160, 12),
			railroad('rr-penn', i18n.RAILROAD_PENN),
			estate('jack', i18n.PROPERTY_JACK, 3, 180, 14),
			communityChest(),
			estate('tn', i18n.PROPERTY_TN, 3, 180, 14),
			estate('ny', i18n.PROPERTY_NY, 3, 200, 16),
			
			parking(),
			estate('kt', i18n.PROPERTY_KT, 4, 220, 18),
			chance(),
			estate('in', i18n.PROPERTY_IN, 4, 220, 18),
			estate('il', i18n.PROPERTY_IL, 4, 240, 20),
			railroad('rr-bo', i18n.RAILROAD_B_O),
			estate('at', i18n.PROPERTY_AT, 5, 260, 22),
			estate('vr', i18n.PROPERTY_VR, 5, 260, 22),
			company('water', i18n.COMPANY_WATER),
			estate('marvin', i18n.PROPERTY_MARVIN, 5, 280, 24),
			
			goToJail(),
			estate('pa', i18n.PROPERTY_PA, 6, 300, 26),
			estate('nc', i18n.PROPERTY_NC, 6, 300, 26),
			communityChest(),
			estate('penn', i18n.PROPERTY_PENN, 6, 320, 28),
			railroad('rr-short', i18n.RAILROAD_SHORT),
			chance(),
			estate('pk', i18n.PROPERTY_PK, 7, 350, 35),
			luxuryTax(),
			estate('bw', i18n.PROPERTY_BW, 7, 400, 50)
		];
	};
	
	function go() {
		return {
			match: match('go')
		};
	}
	
	function jail() {
		return {
			match: match('jail')
		};
	}
	
	function parking() {
		return {
			match: match('parking')
		};
	}
	
	function goToJail() {
		return {
			match: match('go-to-jail')
		};
	}
	
	function communityChest() {
		return {
			match: match('community-chest', [i18n.COMMUNITY_CHEST])
		};
	}
	
	function chance() {
		return {
			match: match('chance', [i18n.CHANCE])
		};
	}
	
	function incomeTax() {
		return {
			match: match('income-tax', [i18n.INCOME_TAX])
		};
	}
	
	function luxuryTax() {
		return {
			match: match('luxury-tax', [i18n.LUXURY_TAX])
		};
	}
	
	function company(id, name) {
		precondition(_.isString(id) && id.length > 0, 'Company must have an id');
		precondition(_.isString(name) && name.length > 0, 'Company must have a name');
		
		return {
			match: match('company', [id, name, 150])
		};
	}
	
	function railroad(id, name) {
		precondition(_.isString(id) && id.length > 0, 'Railroad must have an id');
		precondition(_.isString(name) && name.length > 0, 'Railroad must have a name');
		
		return {
			match: match('railroad', [id, name, 200])
		};
	}
	
	function estate(id, name, group, price, rent) {
		precondition(_.isString(id) && id.length > 0, 'Property must have an id');
		precondition(_.isString(name) && name.length > 0, 'Property must have a name');
		precondition(_.isNumber(group) && group >= 0 && group < 8, 'Property must have a group');
		precondition(_.isNumber(price) && price > 0, 'Property must have a price');
		precondition(_.isNumber(rent) && rent > 0, 'Property must have a rent');
		
		return {
			rent: function() { return rent; },
			match: match('estate', [id, name, price, group])
		};
	}
	
	function match(fn, args) {
		return function (visitor) {
			if (_.isFunction(visitor[fn])) {
				return visitor[fn].apply(this, args);
			}
			
			return visitor['_']();
		};
	}
}());