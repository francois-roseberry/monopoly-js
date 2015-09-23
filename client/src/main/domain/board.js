(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var Company = require('./company');
	var Railroad = require('./railroad');
	var Estate = require('./estate');
	
	exports.estatesInGroup = function (groupIndex) {
		precondition(_.isNumber(groupIndex) && groupIndex >= 0 && groupIndex < 8,
			'Listing estates of a group in board requires the group with an index');
		
		return _.filter(exports.squares(), function (square) {
			return square.match({
				'estate': function () { return square.group().index === groupIndex; },
				_ : function () { return false; }
			});
		});
	};
	
	exports.propertyById = function (propertyId) {
		precondition(_.isString(propertyId) && propertyId.length > 0,
			'Trying to find a property in the board requires the property id');
		
		var match = _.find(exports.squares(), function (square) {
			return square.match({
				'estate': function (id) { return id === propertyId; },
				'railroad': function (id) { return id === propertyId; },
				'company': function (id) { return id === propertyId; },
				_: function () { return false; }
			});
		});
		
		if (match === null) {
			throw new Error('Could not find property with id : ' + propertyId);
		}
		
		return match;
	};
	
	exports.squares = function () {
		var groups = [
			{ index: 0, properties: function () { return exports.estatesInGroup(0); }, color: 'midnightblue' },
			{ index: 1, properties: function () { return exports.estatesInGroup(1); }, color: 'lightskyblue' },
			{ index: 2, properties: function () { return exports.estatesInGroup(2); }, color: 'mediumvioletred' },
			{ index: 3, properties: function () { return exports.estatesInGroup(3); }, color: 'orange' },
			{ index: 4, properties: function () { return exports.estatesInGroup(4); }, color: 'red' },
			{ index: 5, properties: function () { return exports.estatesInGroup(5); }, color: 'yellow' },
			{ index: 6, properties: function () { return exports.estatesInGroup(6); }, color: 'green' },
			{ index: 7, properties: function () { return exports.estatesInGroup(7); }, color: 'blue' }
		];
		
		return [
			go(),
			Estate.mediterranean(groups[0]),
			communityChest(),
			Estate.baltic(groups[0]),
			incomeTax(),
			Railroad.reading(),
			Estate.east(groups[1]),
			chance(),
			Estate.vermont(groups[1]),
			Estate.connecticut(groups[1]),
			
			jail(),
			Estate.charles(groups[2]),
			Company.electric(),
			Estate.us(groups[2]),
			Estate.virginia(groups[2]),
			Railroad.pennsylvania(),
			Estate.jack(groups[3]),
			communityChest(),
			Estate.tennessee(groups[3]),
			Estate.newyork(groups[3]),
			
			parking(),
			Estate.kentucky(groups[4]),
			chance(),
			Estate.indiana(groups[4]),
			Estate.illinois(groups[4]),
			Railroad.bo(),
			Estate.atlantic(groups[5]),
			Estate.ventnor(groups[5]),
			Company.water(),
			Estate.marvin(groups[5]),
			
			goToJail(),
			Estate.pacific(groups[6]),
			Estate.northCarolina(groups[6]),
			communityChest(),
			Estate.pennsylvania(groups[6]),
			Railroad.short(),
			chance(),
			Estate.park(groups[7]),
			luxuryTax(),
			Estate.broadwalk(groups[7])
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