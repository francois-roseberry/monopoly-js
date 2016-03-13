(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	var PropertyGroup = require('./property-group');
	
	exports.isProperty = function (candidate) {
		return candidate instanceof Property;
	};
	
	exports.estate = function (id, name, group, prices) {
		precondition(_.isString(id) && id.length > 0, 'Estate requires an id');
		precondition(_.isString(name) && name.length > 0, 'Estate requires a name');
		precondition(group && PropertyGroup.isGroup(group), 'Estate requires a group');
		precondition(_.isNumber(prices.value) && prices.value > 0, 'Estate requires a price');
		precondition(_.isNumber(prices.rent) && prices.rent > 0, 'Estate requires a rent');
		
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
			return { amount: baseRent * multiplier };
		};
	}
	
	function ownsAllEstatesInGroup(group, properties) {
		var estatesInGroup = group.properties();
		return _.every(estatesInGroup, function (estate) {
			var id = estate.id();
			
			return _.contains(_.map(properties, function (property) { return property.id(); }), id);
		});
	}
	
	exports.company = function (id, name, group) {
		precondition(_.isString(id) && id.length > 0, 'Company requires an id');
		precondition(_.isString(name) && name.length > 0, 'Company requires a name');
		precondition(group && PropertyGroup.isGroup(group), 'Creating a company requires a group');
		
		return new Property({
			id: id,
			name: name,
			group: group,
			type: 'company',
			price: group.propertyValue(),
			rent: companyRent(group)
		});
	};
	
	function companyRent(group) {
		return function (ownerProperties) {
			var multiplier = allCompanies(group, ownerProperties) ? group.multipliers()[1] : group.multipliers()[0];
			return {multiplier: multiplier};
		};
	}
	
	function allCompanies(group, properties) {
		return _.reduce(properties, function (count, property) {
			if (_.contains(_.map(group.properties(), propertyId), property.id())) {
				return count + 1;
			}
			
			return count;
		}, 0) === 2;
	}
	
	exports.railroad = function (id, name, group) {
		precondition(_.isString(id) && id.length > 0, 'Railroad requires an id');
		precondition(_.isString(name) && name.length > 0, 'Railroad requires a name');
		precondition(group && PropertyGroup.isGroup(group), 'Railroad requires a group');
		
		return new Property({
			id: id,
			name: name,
			group: group,
			type: 'railroad',
			price: group.propertyValue(),
			rent: railroadRent(group)
		});
	};
	
	function railroadRent(group) {
		return function (ownerProperties) {
			var count = railroadCountIn(group, ownerProperties);
			return { amount: group.baseRent() * Math.pow(2, count - 1) };
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
		
		var groupComparison = this._group.compareTo(property._group);
		if (groupComparison === 1) {
			return 1;
		} else if (groupComparison === -1) {
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