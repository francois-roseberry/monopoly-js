(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.isProperty = function (candidate) {
		return candidate instanceof Property;
	};
	
	exports.newEstate = function (id, name, group, prices) {
		precondition(_.isString(id) && id.length > 0, 'Estate requires an id');
		precondition(_.isString(name) && name.length > 0, 'Estate requires a name');
		precondition(_.isNumber(group.index) && group.index >= 0 && group.index < 8,
			'Estate requires a group with an id');
		precondition(_.isFunction(group.properties),
			'Estate requires its group to have a function to list all properties in group');
		precondition(_.isNumber(prices.value) && prices.value > 0, 'Estate must have a price');
		precondition(_.isNumber(prices.rent) && prices.rent > 0, 'Estate must have a rent');
		
		return new Property({
			id: id,
			name: name,
			group: group,
			type: 'estate',
			price: prices.value,
			rent: prices.rent
		});
	};
	
	function Property(info) {
		this._id = info.id;
		this._name = info.name;
		this._group = info.group;
		this._price = info.price;
		this._rent = info.rent;
		this._type = info.type;
	}
	
	Property.prototype.id = function () {
		return this._id;
	};
	
	Property.prototype.name = function () {
		return this._name;
	};
	
	Property.prototype.price = function () {
		return this._price;
	};
	
	Property.prototype.rent = function () {
		return this._rent;
	};
	
	Property.prototype.group = function () {
		return this._group;
	};
	
	Property.prototype.match = function (visitor) {
		return matchWithDefault(visitor, this._type, [this._id, this._name, this._price, this._group]);
	};
	
	function matchWithDefault(visitor, fn, args) {
		if (_.isFunction(visitor[fn])) {
			return visitor[fn].apply(visitor, args);
		}
		
		return visitor['_']();
	}
	
	Property.prototype.compareTo = function (property) {
		precondition(property,
			'Comparing this property to another property requires that other property');
		
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
	
	Property.prototype.equals = function (other) {
		precondition(other, 'Testing a property for equality with something else requires that something else');
		
		if (this === other) {
			return true;
		}
		
		return other instanceof Property && this._id === other._id;
	};
}());