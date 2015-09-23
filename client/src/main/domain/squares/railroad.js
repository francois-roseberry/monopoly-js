(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	exports.reading = function () {
		return new Railroad('rr-reading', i18n.RAILROAD_READING);
	};
	
	exports.pennsylvania = function () {
		return new Railroad('rr-penn', i18n.RAILROAD_PENN);
	};
	
	exports.bo = function () {
		return new Railroad('rr-bo', i18n.RAILROAD_B_O);
	};
	
	exports.short = function () {
		return new Railroad('rr-short', i18n.RAILROAD_SHORT);
	};
	
	function Railroad(id, name) {
		this._id = id;
		this._name = name;
		this._price = 200;
	}
	
	Railroad.prototype.id = function () {
		return this._id;
	};
	
	Railroad.prototype.price = function () {
		return this._price;
	};
	
	Railroad.prototype.match = function (visitor) {
		return matchWithDefault(visitor, 'railroad', [this._id, this._name, this._price]);
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
				if (id === otherId) { return 0; }
				if (id === 'rr-reading') { return 1; }
				if (id === 'rr-penn') {
					if (otherId === 'rr-reading') { return -1; }
					return 1;
				}
				if (id === 'rr-bo' && otherId === 'rr-short') {
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