(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.isRailroad = function (candidate) {
		return candidate instanceof Railroad;
	};
	
	exports.create = function (id, name, group) {
		precondition(_.isString(id) && id.length > 0, 'Railroad requires an id');
		precondition(_.isString(name) && name.length > 0, 'Railroad requires a name');
		precondition(group, 'Railroad requires a group');
		
		return new Railroad(id, name, group);
	};
	
	function Railroad(id, name, group) {
		this._id = id;
		this._name = name;
		this._group = group;
		this._price = 200;
	}
	
	Railroad.prototype.id = function () {
		return this._id;
	};
	
	Railroad.prototype.name = function () {
		return this._name;
	};
	
	Railroad.prototype.price = function () {
		return this._price;
	};
	
	Railroad.prototype.rent = function () {
		return 25;
	};
	
	Railroad.prototype.group = function () {
		return this._group;
	};
	
	Railroad.prototype.match = function (visitor) {
		return matchWithDefault(visitor, 'railroad', [this._id, this._name, this._price, this._group]);
	};
	
	function matchWithDefault(visitor, fn, args) {
		if (_.isFunction(visitor[fn])) {
			return visitor[fn].apply(visitor, args);
		}
		
		return visitor['_']();
	}
	
	Railroad.prototype.compareTo = function (property) {
		precondition(property, 'Comparing this property to another property requires that other property');
		
		var id = this._id;
		return property.match({
			'company': function () { return 1; },
			'estate': function () { return -1; },
			'railroad': function (otherId) {
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
	
	Railroad.prototype.equals = function (other) {
		precondition(other, 'Testing a railroad for equality with something else requires that something else');
		
		if (this === other) {
			return true;
		}
		
		return other instanceof Railroad && this._id === other._id;
	};
}());