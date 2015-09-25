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
			rent: estateRent(prices.rent, group)
		});
	};
	
	function estateRent(baseRent, group) {
		return function (ownerProperties) {
			var multiplier = (ownsAllEstatesInGroup(group, ownerProperties) ? 2 : 1);
			return baseRent * multiplier;
		};
	}
	
	function ownsAllEstatesInGroup(group, properties) {
		var estatesInGroup = group.properties();
		return _.every(estatesInGroup, function (estate) {
			var id = estate.id();
			
			return _.contains(_.map(properties, function (property) { return property.id(); }), id);
		});
	}
	
	exports.newCompany = function (id, name, group) {
		precondition(_.isString(id) && id.length > 0, 'Company requires an id');
		precondition(_.isString(name) && name.length > 0, 'Company requires a name');
		precondition(group, 'Creating a company requires a group');
		
		return new Property({
			id: id,
			name: name,
			group: group,
			type: 'company',
			price: 150,
			rent: function () { return 25; }
		});
	};
	
	exports.newRailroad = function (id, name, group) {
		precondition(_.isString(id) && id.length > 0, 'Railroad requires an id');
		precondition(_.isString(name) && name.length > 0, 'Railroad requires a name');
		precondition(group, 'Railroad requires a group');
		
		return new Property({
			id: id,
			name: name,
			group: group,
			type: 'railroad',
			price: 200,
			rent: railroadRent(25, group)
		});
	};
	
	function railroadRent(baseRent, group) {
		return function (ownerProperties) {
			var count = railroadCountIn(group, ownerProperties);
			return baseRent * Math.pow(2, count - 1);
		};
	}
	
	function railroadCountIn(group, properties) {
		return _.reduce(properties, function (count, property) {
			if (_.contains(_.map(group.properties(), propertyId), property.id())) {
				return count + 1;
			}
			
			return count;
		}, 0);
	}
	
	function propertyId(property) {
		return property.id();
	}
	
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
	
	Property.prototype.rent = function (ownerProperties) {
		return this._rent(ownerProperties);
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
		precondition(property && property instanceof Property,
			'Comparing this property to another property requires that other property');
		
		if (this._id === property._id) {
			return 0;
		}
		
		if (this._group.index < property._group.index) {
			return 1;
		} else if (this._group.index > property._group.index) {
			return -1;
		}
		
		var indexesInGroup = {};
		_.each(property._group.properties(), function (estate, index) {
			indexesInGroup[estate.id()] = index;
		});
		
		if (indexesInGroup[this._id] < indexesInGroup[property._id]) {
			return 1;
		}
		
		return -1;		
	};
	
	Property.prototype.equals = function (other) {
		precondition(other, 'Testing a property for equality with something else requires that something else');
		
		if (this === other) {
			return true;
		}
		
		return other instanceof Property && this._id === other._id;
	};
}());