(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var Company = require('./company');
	var Railroad = require('./railroad');
	var Estate = require('./estate');
	
	function estatesInGroup (groupIndex) {
		precondition(_.isNumber(groupIndex) && groupIndex >= 0 && groupIndex < 10,
			'Listing estates of a group in board requires the group index');
		
		return _.filter(exports.squares(), function (square) {
			return square.match({
				'estate': function () { return square.group().index === groupIndex; },
				'company': function () { return square.group().index === groupIndex; },
				'railroad': function () { return square.group().index === groupIndex; },
				_ : function () { return false; }
			});
		});
	}
	
	exports.properties = function () {
		var groups = [
			{ index: 0, properties: function () { return estatesInGroup(0); }, color: 'midnightblue' },
			{ index: 1, properties: function () { return estatesInGroup(1); }, color: 'lightskyblue' },
			{ index: 2, properties: function () { return estatesInGroup(2); }, color: 'mediumvioletred' },
			{ index: 3, properties: function () { return estatesInGroup(3); }, color: 'orange' },
			{ index: 4, properties: function () { return estatesInGroup(4); }, color: 'red' },
			{ index: 5, properties: function () { return estatesInGroup(5); }, color: 'yellow' },
			{ index: 6, properties: function () { return estatesInGroup(6); }, color: 'green' },
			{ index: 7, properties: function () { return estatesInGroup(7); }, color: 'blue' }
		];
		
		var railroadGroup = { index: 8, properties: function () { return estatesInGroup(8); }, color: 'black' };
		var companyGroup = { index: 9, properties: function () { return estatesInGroup(9); }, color: 'lightgreen' };
		
		return {
			mediterranean: 	Estate.create('md', i18n.PROPERTY_MED, groups[0], { value: 60, rent: 2}),
			baltic:			Estate.create('bt', i18n.PROPERTY_BALTIC, groups[0], { value: 60, rent: 4}),
			east:			Estate.create('et', i18n.PROPERTY_EAST, groups[1], { value: 100, rent: 6}),
			vermont:		Estate.create('vt', i18n.PROPERTY_VT, groups[1], { value: 100, rent: 6}),
			connecticut:	Estate.create('cn', i18n.PROPERTY_CONN, groups[1], { value: 120, rent: 8}),
			charles:		Estate.create('cl', i18n.PROPERTY_CHARLES, groups[2], { value: 140, rent: 10}),
			us:				Estate.create('us', i18n.PROPERTY_US, groups[2], { value: 140, rent: 10}),
			virginia:		Estate.create('vn', i18n.PROPERTY_VN, groups[2], { value: 160, rent: 12}),
			jack:			Estate.create('jk', i18n.PROPERTY_JACK, groups[3], { value: 180, rent: 14}),
			tennessee:		Estate.create('tn', i18n.PROPERTY_TN, groups[3], { value: 180, rent: 14}),
			newYork:		Estate.create('ny', i18n.PROPERTY_NY, groups[3], { value: 200, rent: 16}),
			kentucky:		Estate.create('kt', i18n.PROPERTY_KT, groups[4], { value: 220, rent: 18}),
			indiana:		Estate.create('in', i18n.PROPERTY_IN, groups[4], { value: 220, rent: 18}),
			illinois:		Estate.create('il', i18n.PROPERTY_IL, groups[4], { value: 240, rent: 20}),
			atlantic:		Estate.create('at', i18n.PROPERTY_AT, groups[5], { value: 260, rent: 22}),
			ventnor:		Estate.create('vr', i18n.PROPERTY_VR, groups[5], { value: 260, rent: 22}),
			marvin:			Estate.create('mv', i18n.PROPERTY_MARVIN, groups[5], { value: 280, rent: 24}),
			pacific:		Estate.create('pa', i18n.PROPERTY_PA, groups[6], { value: 300, rent: 26}),
			northCarolina:	Estate.create('nc', i18n.PROPERTY_NC, groups[6], { value: 300, rent: 26}),
			pennsylvania:	Estate.create('pn', i18n.PROPERTY_PENN, groups[6], { value: 320, rent: 28}),
			park:			Estate.create('pk', i18n.PROPERTY_PK, groups[7], { value: 350, rent: 35}),
			broadwalk:		Estate.create('bw', i18n.PROPERTY_BW, groups[7], { value: 400, rent: 50}),
			
			readingRailroad:		Railroad.create('rr-reading', i18n.RAILROAD_READING, railroadGroup),
			pennsylvaniaRailroad:	Railroad.create('rr-penn', i18n.RAILROAD_PENN, railroadGroup),
			boRailroad:				Railroad.create('rr-bo', i18n.RAILROAD_B_O, railroadGroup),
			shortRailroad:			Railroad.create('rr-short', i18n.RAILROAD_SHORT, railroadGroup),
			
			electricCompany:	Company.create('electric', i18n.COMPANY_ELECTRIC, companyGroup),
			waterWorks:			Company.create('water', i18n.COMPANY_WATER, companyGroup)
		};
	};
	
	exports.squares = function () {
		var properties = exports.properties();
		
		return [
			go(),
			properties.mediterranean,
			communityChest(),
			properties.baltic,
			incomeTax(),
			properties.readingRailroad,
			properties.east,
			chance(),
			properties.vermont,
			properties.connecticut,
			
			jail(),
			properties.charles,
			properties.electricCompany,
			properties.us,
			properties.virginia,
			properties.pennsylvaniaRailroad,
			properties.jack,
			communityChest(),
			properties.tennessee,
			properties.newYork,
			
			parking(),
			properties.kentucky,
			chance(),
			properties.indiana,
			properties.illinois,
			properties.boRailroad,
			properties.atlantic,
			properties.ventnor,
			properties.waterWorks,
			properties.marvin,
			
			goToJail(),
			properties.pacific,
			properties.northCarolina,
			communityChest(),
			properties.pennsylvania,
			properties.shortRailroad,
			chance(),
			properties.park,
			luxuryTax(),
			properties.broadwalk
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
	
	function match(fn, args) {
		return function (visitor) {
			if (_.isFunction(visitor[fn])) {
				return visitor[fn].apply(this, args);
			}
			
			return visitor['_']();
		};
	}
}());