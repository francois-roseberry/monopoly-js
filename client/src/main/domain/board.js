(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var Property = require('./property');
	var PropertyGroup = require('./property-group');
	
	exports.properties = function () {
		var groups = [
			PropertyGroup.newGroup(0, 'midnightblue', groupMembers),
			PropertyGroup.newGroup(1, 'lightskyblue', groupMembers),
			PropertyGroup.newGroup(2, 'mediumvioletred', groupMembers),
			PropertyGroup.newGroup(3, 'orange', groupMembers),
			PropertyGroup.newGroup(4, 'red', groupMembers),
			PropertyGroup.newGroup(5, 'yellow', groupMembers),
			PropertyGroup.newGroup(6, 'green', groupMembers),
			PropertyGroup.newGroup(7, 'blue', groupMembers)
		];
		
		var railroadGroup = PropertyGroup.newGroup(8, 'black', groupMembers);
		var companyGroup =  PropertyGroup.newGroup(9, 'lightgreen', groupMembers);
		
		return {
			mediterranean: 		Property.newEstate('md', i18n.PROPERTY_MD, groups[0], { value: 60,  rent: 2}),
			baltic:			Property.newEstate('bt', i18n.PROPERTY_BT, groups[0], { value: 60,  rent: 4}),
			east:			Property.newEstate('et', i18n.PROPERTY_ET, groups[1], { value: 100, rent: 6}),
			vermont:		Property.newEstate('vt', i18n.PROPERTY_VT, groups[1], { value: 100, rent: 6}),
			connecticut:		Property.newEstate('cn', i18n.PROPERTY_CN, groups[1], { value: 120, rent: 8}),
			charles:		Property.newEstate('cl', i18n.PROPERTY_CL, groups[2], { value: 140, rent: 10}),
			us:			Property.newEstate('us', i18n.PROPERTY_US, groups[2], { value: 140, rent: 10}),
			virginia:		Property.newEstate('vn', i18n.PROPERTY_VN, groups[2], { value: 160, rent: 12}),
			jack:			Property.newEstate('jk', i18n.PROPERTY_JK, groups[3], { value: 180, rent: 14}),
			tennessee:		Property.newEstate('tn', i18n.PROPERTY_TN, groups[3], { value: 180, rent: 14}),
			newYork:		Property.newEstate('ny', i18n.PROPERTY_NY, groups[3], { value: 200, rent: 16}),
			kentucky:		Property.newEstate('kt', i18n.PROPERTY_KT, groups[4], { value: 220, rent: 18}),
			indiana:		Property.newEstate('in', i18n.PROPERTY_IN, groups[4], { value: 220, rent: 18}),
			illinois:		Property.newEstate('il', i18n.PROPERTY_IL, groups[4], { value: 240, rent: 20}),
			atlantic:		Property.newEstate('at', i18n.PROPERTY_AT, groups[5], { value: 260, rent: 22}),
			ventnor:		Property.newEstate('vr', i18n.PROPERTY_VR, groups[5], { value: 260, rent: 22}),
			marvin:			Property.newEstate('mv', i18n.PROPERTY_MN, groups[5], { value: 280, rent: 24}),
			pacific:		Property.newEstate('pa', i18n.PROPERTY_PA, groups[6], { value: 300, rent: 26}),
			northCarolina:		Property.newEstate('nc', i18n.PROPERTY_NC, groups[6], { value: 300, rent: 26}),
			pennsylvania:		Property.newEstate('pn', i18n.PROPERTY_PN, groups[6], { value: 320, rent: 28}),
			park:			Property.newEstate('pk', i18n.PROPERTY_PK, groups[7], { value: 350, rent: 35}),
			broadwalk:		Property.newEstate('bw', i18n.PROPERTY_BW, groups[7], { value: 400, rent: 50}),
			
			readingRailroad:	Property.newRailroad('rr-reading', i18n.RAILROAD_READING, railroadGroup),
			pennsylvaniaRailroad:	Property.newRailroad('rr-penn', i18n.RAILROAD_PENN, railroadGroup),
			boRailroad:		Property.newRailroad('rr-bo', i18n.RAILROAD_B_O, railroadGroup),
			shortRailroad:		Property.newRailroad('rr-short', i18n.RAILROAD_SHORT, railroadGroup),
			
			electricCompany:	Property.newCompany('electric', i18n.COMPANY_ELECTRIC, companyGroup),
			waterWorks:		Property.newCompany('water', i18n.COMPANY_WATER, companyGroup)
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
	
	function groupMembers(groupIndex) {
		precondition(_.isNumber(groupIndex) && groupIndex >= 0 && groupIndex < 10,
			'Listing members of a group in board requires the group index');
		
		return _.filter(exports.properties(), function (square) {
			return square.group().index() === groupIndex;
		});
	}
	
	function go() {
		return {
			match: match('go'),
			equals: hasId('go')
		};
	}
	
	function jail() {
		return {
			match: match('jail'),
			equals: hasId('jail')
		};
	}
	
	function parking() {
		return {
			match: match('parking'),
			equals: hasId('parking')
		};
	}
	
	function goToJail() {
		return {
			match: match('go-to-jail'),
			equals: hasId('go-to-jail')
		};
	}
	
	function communityChest() {
		return {
			match: match('community-chest', [i18n.COMMUNITY_CHEST]),
			equals: hasId('community-chest')
		};
	}
	
	function chance() {
		return {
			match: match('chance', [i18n.CHANCE]),
			equals: hasId('chance')
		};
	}
	
	function incomeTax() {
		return {
			match: match('income-tax', [i18n.INCOME_TAX]),
			equals: hasId('income-tax')
		};
	}
	
	function luxuryTax() {
		return {
			match: match('luxury-tax', [i18n.LUXURY_TAX]),
			equals: hasId('luxury-tax')
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
	
	function hasId(id) {
		return function (other) {
			precondition(other, 'Testing a square for equality with something else requires that something else');
			
			if (_.isFunction(other.match)) {
				var matcher = { _: function () { return false; } };
				matcher[id] = function () { return true; };
				return other.match(matcher);
			}
			
			return false;
		};
	}
}());
