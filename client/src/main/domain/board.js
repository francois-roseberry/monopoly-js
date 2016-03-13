(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var Property = require('./property');
	var PropertyGroup = require('./property-group');
	
	exports.isBoard = function (candidate) {
		return candidate instanceof Board;
	};
	
	exports.standard = function () {
		var properties = standardProperties();
		return new Board({
			squares: standardSquares(properties),
			properties: properties,
			jailPosition: 10,
			jailBailout: 50,
			startMoney: 1500,
			salary: 200
		});
	};
	
	function Board(info) {
		this._squares = info.squares;
		this._properties = info.properties;
		this._jailPosition = info.jailPosition;
		this._jailBailout = info.jailBailout;
		this._startMoney = info.startMoney;
		this._salary = info.salary;
	}
	
	Board.prototype.playerParameters = function () {
		return {
			startMoney: this._startMoney,
			boardSize: this._squares.length,
			salary: this._salary,
			jailPosition: this._jailPosition
		};
	};
	
	Board.prototype.jailBailout = function () {
		return this._jailBailout;
	};
	
	Board.prototype.properties = function () {
		return this._properties;
	};
	
	Board.prototype.squares = function () {
		return this._squares;
	};
	
	Board.prototype.equals = function (other) {
		precondition(other, 'Testing a board for equality with something else requires that something else');
		
		if (this === other) {
			return true;
		}
		
		if (!(other instanceof Board)) {
			return false;
		}
		
		if (!deepEquals(this._squares, other._squares)) {
			return false;
		}
		
		if (this._jailBailout !== other._jailBailout) {
			return false;
		}
		
		return true;
	};
	
	function standardProperties() {
		var groups = [
			PropertyGroup.newGroup(0, 'midnightblue',    groupMembers),
			PropertyGroup.newGroup(1, 'lightskyblue',    groupMembers),
			PropertyGroup.newGroup(2, 'mediumvioletred', groupMembers),
			PropertyGroup.newGroup(3, 'orange',          groupMembers),
			PropertyGroup.newGroup(4, 'red',             groupMembers),
			PropertyGroup.newGroup(5, 'yellow',          groupMembers),
			PropertyGroup.newGroup(6, 'green',           groupMembers),
			PropertyGroup.newGroup(7, 'blue',            groupMembers)
		];
		
		var railroadGroup = PropertyGroup.railroadGroup(8, 'black',      groupMembers, {value: 200, baseRent: 25});
		var companyGroup =  PropertyGroup.companyGroup(9, ' lightgreen', groupMembers,
			{value: 150, multipliers: [4,10]});
		
		return {
			mediterranean: 	Property.estate('md', i18n.PROPERTY_MD, groups[0], {value: 60,  rent: 2}),
			baltic:			Property.estate('bt', i18n.PROPERTY_BT, groups[0], {value: 60,  rent: 4}),
			east:			Property.estate('et', i18n.PROPERTY_ET, groups[1], {value: 100, rent: 6}),
			vermont:		Property.estate('vt', i18n.PROPERTY_VT, groups[1], {value: 100, rent: 6}),
			connecticut:	Property.estate('cn', i18n.PROPERTY_CN, groups[1], {value: 120, rent: 8}),
			charles:		Property.estate('cl', i18n.PROPERTY_CL, groups[2], {value: 140, rent: 10}),
			us:				Property.estate('us', i18n.PROPERTY_US, groups[2], {value: 140, rent: 10}),
			virginia:		Property.estate('vn', i18n.PROPERTY_VN, groups[2], {value: 160, rent: 12}),
			jack:			Property.estate('jk', i18n.PROPERTY_JK, groups[3], {value: 180, rent: 14}),
			tennessee:		Property.estate('tn', i18n.PROPERTY_TN, groups[3], {value: 180, rent: 14}),
			newYork:		Property.estate('ny', i18n.PROPERTY_NY, groups[3], {value: 200, rent: 16}),
			kentucky:		Property.estate('kt', i18n.PROPERTY_KT, groups[4], {value: 220, rent: 18}),
			indiana:		Property.estate('in', i18n.PROPERTY_IN, groups[4], {value: 220, rent: 18}),
			illinois:		Property.estate('il', i18n.PROPERTY_IL, groups[4], {value: 240, rent: 20}),
			atlantic:		Property.estate('at', i18n.PROPERTY_AT, groups[5], {value: 260, rent: 22}),
			ventnor:		Property.estate('vr', i18n.PROPERTY_VR, groups[5], {value: 260, rent: 22}),
			marvin:			Property.estate('mv', i18n.PROPERTY_MN, groups[5], {value: 280, rent: 24}),
			pacific:		Property.estate('pa', i18n.PROPERTY_PA, groups[6], {value: 300, rent: 26}),
			northCarolina:	Property.estate('nc', i18n.PROPERTY_NC, groups[6], {value: 300, rent: 26}),
			pennsylvania:	Property.estate('pn', i18n.PROPERTY_PN, groups[6], {value: 320, rent: 28}),
			park:			Property.estate('pk', i18n.PROPERTY_PK, groups[7], {value: 350, rent: 35}),
			broadwalk:		Property.estate('bw', i18n.PROPERTY_BW, groups[7], {value: 400, rent: 50}),
			
			readingRailroad:		Property.railroad('rr-reading', i18n.RAILROAD_READING, railroadGroup),
			pennsylvaniaRailroad:	Property.railroad('rr-penn',    i18n.RAILROAD_PENN,    railroadGroup),
			boRailroad:				Property.railroad('rr-bo',      i18n.RAILROAD_B_O,     railroadGroup),
			shortRailroad:			Property.railroad('rr-short',   i18n.RAILROAD_SHORT,   railroadGroup),
			
			electricCompany:	Property.company('electric', i18n.COMPANY_ELECTRIC, companyGroup),
			waterWorks:			Property.company('water',    i18n.COMPANY_WATER,    companyGroup)
		};
	}
	
	function standardSquares(properties) {
		return [
			go(),
			properties.mediterranean,
			communityChest(),
			properties.baltic,
			incomeTax(10, 200),
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
			luxuryTax(75),
			properties.broadwalk
		];
	}
	
	function deepEquals(left, right) {
		if (left.length !== right.length) {
			return false;
		}
		
		return _.every(left, function (element, index) {
			return element.equals(right[index]);
		});
	}
	
	function groupMembers(groupIndex) {
		precondition(_.isNumber(groupIndex) && groupIndex >= 0 && groupIndex < 10,
			'Listing members of a group in board requires the group index');
		
		return _.filter(standardProperties(), function (square) {
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
	
	function incomeTax(percentageTax, flatTax) {
		return {
			match: match('income-tax', [i18n.INCOME_TAX, percentageTax, flatTax]),
			equals: hasId('income-tax')
		};
	}
	
	function luxuryTax(amount) {
		return {
			match: match('luxury-tax', [i18n.LUXURY_TAX, amount]),
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
