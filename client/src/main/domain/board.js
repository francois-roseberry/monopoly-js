(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var Company = require('./company');
	var Railroad = require('./railroad');
	var Estate = require('./estate');
	
	exports.estatesInGroup = function (group) {
		precondition(_.isNumber(group) && group >= 0 && group < 8,
			'Listing estates of a group must requires the group index');
		
		return _.filter(exports.squares(), function (square) {
			return square.match({
				'estate': function () { return square.group() === group; },
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
		return [
			go(),
			Estate.mediterranean(exports.estatesInGroup),
			communityChest(),
			Estate.baltic(exports.estatesInGroup),
			incomeTax(),
			Railroad.reading(),
			Estate.east(exports.estatesInGroup),
			chance(),
			Estate.vermont(exports.estatesInGroup),
			Estate.connecticut(exports.estatesInGroup),
			
			jail(),
			Estate.charles(exports.estatesInGroup),
			Company.electric(),
			Estate.us(exports.estatesInGroup),
			Estate.virginia(exports.estatesInGroup),
			Railroad.pennsylvania(),
			Estate.jack(exports.estatesInGroup),
			communityChest(),
			Estate.tennessee(exports.estatesInGroup),
			Estate.newyork(exports.estatesInGroup),
			
			parking(),
			Estate.kentucky(exports.estatesInGroup),
			chance(),
			Estate.indiana(exports.estatesInGroup),
			Estate.illinois(exports.estatesInGroup),
			Railroad.bo(),
			Estate.atlantic(exports.estatesInGroup),
			Estate.ventnor(exports.estatesInGroup),
			Company.water(),
			Estate.marvin(exports.estatesInGroup),
			
			goToJail(),
			Estate.pacific(exports.estatesInGroup),
			Estate.northCarolina(exports.estatesInGroup),
			communityChest(),
			Estate.pennsylvania(exports.estatesInGroup),
			Railroad.short(),
			chance(),
			Estate.park(exports.estatesInGroup),
			luxuryTax(),
			Estate.broadwalk(exports.estatesInGroup)
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
	
	/*function estate(id, name, group, price, rent) {
		precondition(_.isString(id) && id.length > 0, 'Property must have an id');
		precondition(_.isString(name) && name.length > 0, 'Property must have a name');
		precondition(_.isNumber(group) && group >= 0 && group < 8, 'Property must have a group');
		precondition(_.isNumber(price) && price > 0, 'Property must have a price');
		precondition(_.isNumber(rent) && rent > 0, 'Property must have a rent');
		
		return {
			id: function() { return id; },
			price: function () { return price; },
			group: function() { return group; },
			rent: function() { return rent; },
			match: match('estate', [id, name, price, group]),
			compareTo: function (property) {
				precondition(property, 'Comparing this property to another property requires that other property');
				
				return property.match({
					'railroad': function () { return 1; },
					'company': function () { return 1; },
					'estate': function (otherId, otherName, otherPrice, otherGroup) {
						if (id === otherId) {
							return 0;
						}
						
						if (group < otherGroup) {
							return 1;
						} else if (group > otherGroup) {
							return -1;
						}
						var indexesInGroup = {};
						_.each(exports.estatesInGroup(group), function (estate, index) {
							indexesInGroup[estate.id()] = index;
						});
						if (indexesInGroup[id] < indexesInGroup[otherId]) {
							return 1;
						}
						
						return -1;
					}
				});
			}
		};
	}*/
	
	function match(fn, args) {
		return function (visitor) {
			if (_.isFunction(visitor[fn])) {
				return visitor[fn].apply(this, args);
			}
			
			return visitor['_']();
		};
	}
}());