(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	exports.mediterranean = function (group) {
		return new Estate('med', i18n.PROPERTY_MED, group, { value: 60, rent: 2});
	};
	
	exports.baltic = function (group) {
		return new Estate('baltic', i18n.PROPERTY_BALTIC, group, { value: 60, rent: 4});
	};
	
	exports.east = function (group) {
		return new Estate('east', i18n.PROPERTY_EAST, group, { value: 100, rent: 6});
	};
	
	exports.vermont = function (group) {
		return new Estate('vt', i18n.PROPERTY_VT, group, { value: 100, rent: 6});
	};
	
	exports.connecticut = function (group) {
		return new Estate('conn', i18n.PROPERTY_CONN, group, { value: 120, rent: 8});
	};
	
	exports.charles = function (group) {
		return new Estate('charles', i18n.PROPERTY_CHARLES, group, { value: 140, rent: 10});
	};
	
	exports.us = function (group) {
		return new Estate('us', i18n.PROPERTY_US, group, { value: 140, rent: 10});
	};
	
	exports.virginia = function (group) {
		return new Estate('vn', i18n.PROPERTY_VN, group, { value: 160, rent: 12});
	};
	
	exports.jack = function (group) {
		return new Estate('jack', i18n.PROPERTY_JACK, group, { value: 180, rent: 14});
	};
	
	exports.tennessee = function (group) {
		return new Estate('tn', i18n.PROPERTY_TN, group, { value: 180, rent: 14});
	};
	
	exports.newyork = function (group) {
		return new Estate('ny', i18n.PROPERTY_NY, group, { value: 200, rent: 16});
	};
	
	exports.kentucky = function (group) {
		return new Estate('kt', i18n.PROPERTY_KT, group, { value: 220, rent: 18});
	};
	
	exports.indiana = function (group) {
		return new Estate('in', i18n.PROPERTY_IN, group, { value: 220, rent: 18});
	};
	
	exports.illinois = function (group) {
		return new Estate('il', i18n.PROPERTY_IL, group, { value: 240, rent: 20});
	};
	
	exports.atlantic = function (group) {
		return new Estate('at', i18n.PROPERTY_AT, group, { value: 260, rent: 22});
	};
	
	exports.ventnor = function (group) {
		return new Estate('vr', i18n.PROPERTY_VR, group, { value: 260, rent: 22});
	};
	
	exports.marvin = function (group) {
		return new Estate('marvin', i18n.PROPERTY_MARVIN, group, { value: 280, rent: 24});
	};
	
	exports.pacific = function (group) {
		return new Estate('pa', i18n.PROPERTY_PA, group, { value: 300, rent: 26});
	};
	
	exports.northCarolina = function (group) {
		return new Estate('nc', i18n.PROPERTY_NC, group, { value: 300, rent: 26});
	};
	
	exports.pennsylvania = function (group) {
		return new Estate('penn', i18n.PROPERTY_PENN, group, { value: 320, rent: 28});
	};
	
	exports.park = function (group) {
		return new Estate('pk', i18n.PROPERTY_PK, group, { value: 350, rent: 35});
	};
	
	exports.broadwalk = function (group) {
		return new Estate('bw', i18n.PROPERTY_BW, group, { value: 400, rent: 50});
	};
	
	function Estate(id, name, group, prices) {
		precondition(_.isString(id) && id.length > 0, 'Estate requires an id');
		precondition(_.isString(name) && name.length > 0, 'Estate requires a name');
		precondition(_.isNumber(group.index) && group.index >= 0 && group.index < 8,
			'Estate requires a group with an id');
		precondition(_.isFunction(group.properties),
			'Estate requires its group to have a function to list all properties in group');
		precondition(_.isNumber(prices.value) && prices.value > 0, 'Property must have a price');
		precondition(_.isNumber(prices.rent) && prices.rent > 0, 'Property must have a rent');
		
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