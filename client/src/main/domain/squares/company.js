(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.isCompany = function (candidate) {
		return candidate instanceof Company;
	};
	
	exports.create = function (id, name, group) {
		precondition(_.isString(id) && id.length > 0, 'Company requires an id');
		precondition(_.isString(name) && name.length > 0, 'Company requires a name');
		precondition(group, 'Creating a company requires a group');
		
		return new Company(id, name, group);
	};
	
	function Company(id, name, group) {				
		this._id = id;
		this._name = name;
		this._price = 150;
		this._group = group;
	}
	
	Company.prototype.id = function () {
		return this._id;
	};
	
	Company.prototype.name = function () {
		return this._name;
	};
	
	Company.prototype.price = function () {
		return this._price;
	};
	
	Company.prototype.rent = function () {
		return 25;
	};
	
	Company.prototype.group = function () {
		return this._group;
	};
	
	Company.prototype.match = function (visitor) {
		return matchWithDefault(visitor, 'company', [this._id, this._name, this._price, this._group]);
	};
	
	function matchWithDefault(visitor, fn, args) {
		if (_.isFunction(visitor[fn])) {
			return visitor[fn].apply(visitor, args);
		}
		
		return visitor['_']();
	}
	
	Company.prototype.compareTo = function (property) {
		precondition(property, 'Comparing this property to another property requires that other property');
		
		var id = this._id;
		return property.match({
			'railroad': function () { return -1; },
			'estate': function () { return -1; },
			'company': function (otherId) {
				if (id === otherId) {
					return 0;
				}
				
				var indexesInGroup = {};
				_.each(property.group().properties(), function (estate, index) {
					indexesInGroup[estate.id()] = index;
				});
				
				if (indexesInGroup[id] < indexesInGroup[otherId]) {
					return 1;
				}
				
				return -1;
			}
		});
	};
	
	Company.prototype.equals = function (other) {
		precondition(other, 'Testing a company for equality with something else requires that something else');
		
		if (this === other) {
			return true;
		}
		
		return other instanceof Company && this._id === other._id;
	};
}());