(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.isEstate = function (candidate) {
		return candidate instanceof Estate;
	};
	
	exports.create = function (id, name, group, prices) {
		precondition(_.isString(id) && id.length > 0, 'Estate requires an id');
		precondition(_.isString(name) && name.length > 0, 'Estate requires a name');
		precondition(_.isNumber(group.index) && group.index >= 0 && group.index < 8,
			'Estate requires a group with an id');
		precondition(_.isFunction(group.properties),
			'Estate requires its group to have a function to list all properties in group');
		precondition(_.isNumber(prices.value) && prices.value > 0, 'Estate must have a price');
		precondition(_.isNumber(prices.rent) && prices.rent > 0, 'Estate must have a rent');
		
		return new Estate(id, name, group, prices);
	};
	
	function Estate(id, name, group, prices) {
		this._id = id;
		this._name = name;
		this._group = group;
		this._price = prices.value;
		this._rent = prices.rent;
	}
	
	Estate.prototype.id = function () {
		return this._id;
	};
	
	Estate.prototype.name = function () {
		return this._name;
	};
	
	Estate.prototype.price = function () {
		return this._price;
	};
	
	Estate.prototype.rent = function () {
		return this._rent;
	};
	
	Estate.prototype.group = function () {
		return this._group;
	};
	
	Estate.prototype.match = function (visitor) {
		return matchWithDefault(visitor, 'estate', [this._id, this._name, this._price, this._group]);
	};
	
	function matchWithDefault(visitor, fn, args) {
		if (_.isFunction(visitor[fn])) {
			return visitor[fn].apply(visitor, args);
		}
		
		return visitor['_']();
	}
	
	Estate.prototype.compareTo = function (property) {
		precondition(property, 'Comparing this property to another property requires that other property');
		
		var id = this._id;
		var group = this._group;
		return property.match({
			'railroad': function () { return 1; },
			'company': function () { return 1; },
			'estate': function (otherId, otherName, otherPrice, otherGroup) {
				if (id === otherId) {
					return 0;
				}
				
				if (group.index < otherGroup.index) {
					return 1;
				} else if (group.index > otherGroup.index) {
					return -1;
				}
				
				var indexesInGroup = {};
				_.each(group.properties(), function (estate, index) {
					indexesInGroup[estate.id()] = index;
				});
				
				if (indexesInGroup[id] < indexesInGroup[otherId]) {
					return 1;
				}
				
				return -1;
			}
		});
	};
	
	Estate.prototype.equals = function (other) {
		precondition(other, 'Testing an estate for equality with something else requires that something else');
		
		if (this === other) {
			return true;
		}
		
		return other instanceof Estate && this._id === other._id;
	};
}());