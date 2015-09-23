(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	exports.electric = function () {
		return new Company('electric', i18n.COMPANY_ELECTRIC);
	};
	
	exports.water = function () {
		return new Company('water', i18n.COMPANY_WATER);
	};
	
	function Company(id, name) {
		this._id = id;
		this._name = name;
		this._price = 150;
	}
	
	Company.prototype.id = function () {
		return this._id;
	};
	
	Company.prototype.price = function () {
		return this._price;
	};
	
	Company.prototype.match = function (visitor) {
		return matchWithDefault(visitor, 'company', [this._id, this._name, this._price]);
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
				if (id === otherId) { return 0; }
				return (otherId === 'electric' ? -1 : 1);
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