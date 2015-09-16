(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	exports.rollDice = function () {
		return {
			id: 'roll-dice',
			name: i18n.CHOICE_ROLL_DICE,
			equals: function (other) {
				if (!_.isString(other.id) || !_.isFunction(other.match)) {
					return false;
				}
				
				return this.id === other.id;
			},
			match: function (visitor) {
				return visitor['roll-dice']();
			}
		};
	};
	
	exports.finishTurn = function () {
		return {
			id: 'finish-turn',
			name: i18n.CHOICE_FINISH_TURN,
			equals: function (other) {
				if (!_.isString(other.id) || !_.isFunction(other.match)) {
					return false;
				}
				
				return this.id === other.id;
			},
			match: function (visitor) {
				return visitor['finish-turn']();
			}
		};
	};
	
	exports.buyProperty = function (propertyId, name, price) {
		precondition(_.isString(propertyId), 'Buy property choice requires a property id');
		precondition(_.isString(name), 'Buy property choice requires a property name');
		precondition(_.isNumber(price) && price > 0, 'Buy property choice requires a price greater than 0');
		
		return {
			id: 'buy-property',
			name: i18n.CHOICE_BUY_PROPERTY.replace('{property}', name).replace('{price}', i18n.formatPrice(price)),
			equals: function (other) {
				if (!_.isString(other.id) || !_.isFunction(other.match)) {
					return false;
				}
				
				if (this.id !== other.id) {
					return false;
				}
				
				return other.match({
					'buy-property': function (otherPropertyId, otherPrice) {
						return otherPropertyId === propertyId && otherPrice === price;
					}
				});
			},
			match: function (visitor) {
				return visitor['buy-property'](propertyId, price);
			}
		};
	};
	
	exports.payRent = function (rent, toPlayerId, toPlayerName) {
		precondition(_.isNumber(rent) && rent > 0, 'Pay rent choice requires a rent greater than 0');
		precondition(_.isString(toPlayerId), 'Pay rent choice requires the id of the player to pay to');
		precondition(_.isString(toPlayerName), 'Pay rent choice requires the name of the player to pay to');
		
		return {
			id: 'pay-rent',
			name: i18n.CHOICE_PAY_RENT.replace('{rent}', i18n.formatPrice(rent)).replace('{toPlayer}', toPlayerName),
			equals: function (other) {
				if (!_.isString(other.id) || !_.isFunction(other.match)) {
					return false;
				}
				
				if (this.id !== other.id) {
					return false;
				}
				
				return other.match({
					'pay-rent': function (otherRent, otherToPlayerId) {
						return otherRent === rent && otherToPlayerId === toPlayerId;
					}
				});
			},
			match: function (visitor) {
				return visitor['pay-rent'](rent, toPlayerId);
			}
		};
	};
	
	exports.goBankrupt = function () {
		return {
			id: 'go-bankrupt',
			name: i18n.CHOICE_GO_BANKRUPT,
			equals: function (other) {
				if (!_.isString(other.id) || !_.isFunction(other.match)) {
					return false;
				}
				
				return this.id === other.id;
			},
			match: function (visitor) {
				return visitor['go-bankrupt']();
			}
		};
	};
}());