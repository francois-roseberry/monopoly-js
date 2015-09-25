(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	var Property = require('./property');
	
	exports.newChoice = function (property) {
		precondition(Property.isProperty(property), 'Buy property choice requires a property');
		
		return new BuyPropertyChoice(property);
	};
	
	function BuyPropertyChoice(property) {
		this.id = 'buy-property';
		this.name = i18n.CHOICE_BUY_PROPERTY.replace('{property}', property.name())
			.replace('{price}', i18n.formatPrice(property.price()));
		this._property = property;
	}
	
	BuyPropertyChoice.prototype.equals = function (other) {
		if (!(other instanceof BuyPropertyChoice)) {
			return false;
		}
		
		var self = this;
		return other.match({
			'buy-property': function (property) {
				return self._property.equals(property);
			}
		});
	};
	
	BuyPropertyChoice.prototype.match = function (visitor) {
		return visitor[this.id](this._property);
	};
}());