(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	exports.newChoice = function (propertyId, name, price) {
		precondition(_.isString(propertyId) && propertyId.length > 0, 'Buy property choice requires a property id');
		precondition(_.isString(name), 'Buy property choice requires a property name');
		precondition(_.isNumber(price) && price > 0, 'Buy property choice requires a price greater than 0');
		
		return new BuyPropertyChoice(propertyId, name, price);
	};
	
	function BuyPropertyChoice(propertyId, name, price) {
		this.id = 'buy-property';
		this.name = i18n.CHOICE_BUY_PROPERTY.replace('{property}', name).replace('{price}', i18n.formatPrice(price));
		this._propertyId = propertyId;
		this._price = price;
	}
	
	BuyPropertyChoice.prototype.equals = function (other) {
		if (!(other instanceof BuyPropertyChoice)) {
			return false;
		}
		
		var self = this;
		return other.match({
			'buy-property': function (propertyId, price) {
				return self._propertyId === propertyId && self._price === price;
			}
		});
	};
	
	BuyPropertyChoice.prototype.match = function (visitor) {
		return visitor[this.id](this._propertyId, this._price);
	};
}());