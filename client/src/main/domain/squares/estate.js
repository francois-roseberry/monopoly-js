(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	exports.mediterranean = function (estatesInGroup) {
		return new Estate('med', i18n.PROPERTY_MED, 0, { value: 60, rent: 2}, estatesInGroup);
	};
	
	exports.baltic = function (estatesInGroup) {
		return new Estate('baltic', i18n.PROPERTY_BALTIC, 0, { value: 60, rent: 4}, estatesInGroup);
	};
	
	exports.east = function (estatesInGroup) {
		return new Estate('east', i18n.PROPERTY_EAST, 1, { value: 100, rent: 6}, estatesInGroup);
	};
	
	exports.vermont = function (estatesInGroup) {
		return new Estate('vt', i18n.PROPERTY_VT, 1, { value: 100, rent: 6}, estatesInGroup);
	};
	
	exports.connecticut = function (estatesInGroup) {
		return new Estate('conn', i18n.PROPERTY_CONN, 1, { value: 120, rent: 8}, estatesInGroup);
	};
	
	exports.charles = function (estatesInGroup) {
		return new Estate('charles', i18n.PROPERTY_CHARLES, 2, { value: 140, rent: 10}, estatesInGroup);
	};
	
	exports.us = function (estatesInGroup) {
		return new Estate('us', i18n.PROPERTY_US, 2, { value: 140, rent: 10}, estatesInGroup);
	};
	
	exports.virginia = function (estatesInGroup) {
		return new Estate('vn', i18n.PROPERTY_VN, 2, { value: 160, rent: 12}, estatesInGroup);
	};
	
	exports.jack = function (estatesInGroup) {
		return new Estate('jack', i18n.PROPERTY_JACK, 3, { value: 180, rent: 14}, estatesInGroup);
	};
	
	exports.tennessee = function (estatesInGroup) {
		return new Estate('tn', i18n.PROPERTY_TN, 3, { value: 180, rent: 14}, estatesInGroup);
	};
	
	exports.newyork = function (estatesInGroup) {
		return new Estate('ny', i18n.PROPERTY_NY, 3, { value: 200, rent: 16}, estatesInGroup);
	};
	
	exports.kentucky = function (estatesInGroup) {
		return new Estate('kt', i18n.PROPERTY_KT, 4, { value: 220, rent: 18}, estatesInGroup);
	};
	
	exports.indiana = function (estatesInGroup) {
		return new Estate('in', i18n.PROPERTY_IN, 4, { value: 220, rent: 18}, estatesInGroup);
	};
	
	exports.illinois = function (estatesInGroup) {
		return new Estate('il', i18n.PROPERTY_IL, 4, { value: 240, rent: 20}, estatesInGroup);
	};
	
	exports.atlantic = function (estatesInGroup) {
		return new Estate('at', i18n.PROPERTY_AT, 5, { value: 260, rent: 22}, estatesInGroup);
	};
	
	exports.ventnor = function (estatesInGroup) {
		return new Estate('vr', i18n.PROPERTY_VR, 5, { value: 260, rent: 22}, estatesInGroup);
	};
	
	exports.marvin = function (estatesInGroup) {
		return new Estate('marvin', i18n.PROPERTY_MARVIN, 5, { value: 280, rent: 24}, estatesInGroup);
	};
	
	exports.pacific = function (estatesInGroup) {
		return new Estate('pa', i18n.PROPERTY_PA, 6, { value: 300, rent: 26}, estatesInGroup);
	};
	
	exports.northCarolina = function (estatesInGroup) {
		return new Estate('nc', i18n.PROPERTY_NC, 6, { value: 300, rent: 26}, estatesInGroup);
	};
	
	exports.pennsylvania = function (estatesInGroup) {
		return new Estate('penn', i18n.PROPERTY_PENN, 6, { value: 320, rent: 28}, estatesInGroup);
	};
	
	exports.park = function (estatesInGroup) {
		return new Estate('pk', i18n.PROPERTY_PK, 7, { value: 350, rent: 35}, estatesInGroup);
	};
	
	exports.broadwalk = function (estatesInGroup) {
		return new Estate('bw', i18n.PROPERTY_BW, 7, { value: 400, rent: 50}, estatesInGroup);
	};
	
	function Estate(id, name, group, prices, estatesInGroup) {
		precondition(_.isString(id) && id.length > 0, 'Property must have an id');
		precondition(_.isString(name) && name.length > 0, 'Property must have a name');
		precondition(_.isNumber(group) && group >= 0 && group < 8, 'Property must have a group');
		precondition(_.isNumber(prices.value) && prices.value > 0, 'Property must have a price');
		precondition(_.isNumber(prices.rent) && prices.rent > 0, 'Property must have a rent');
		precondition(_.isFunction(estatesInGroup), 'Estate requires a function to list all estates in its group');
		
		this._id = id;
		this._name = name;
		this._group = group;
		this._price = prices.value;
		this._rent = prices.rent;
		this._estatesInGroup = estatesInGroup;
	}
	
	Estate.prototype.id = function () {
		return this._id;
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
		var estatesInGroup = this._estatesInGroup;
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
				_.each(estatesInGroup(group), function (estate, index) {
					indexesInGroup[estate.id()] = index;
				});
				if (indexesInGroup[id] < indexesInGroup[otherId]) {
					return 1;
				}
				
				return -1;
			}
		});
	};
}());