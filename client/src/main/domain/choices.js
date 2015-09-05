(function() {
	"use strict";
	
	var i18n = require('./i18n');
	
	exports.rollDice = function () {
		return {
			id: 'roll-dice',
			name: i18n.CHOICE_ROLL_DICE,
			match: function (visitor) {
				return visitor['roll-dice']();
			}
		};
	};
	
	exports.finishTurn = function () {
		return {
			id: 'finish-turn',
			name: i18n.CHOICE_FINISH_TURN,
			match: function (visitor) {
				return visitor['finish-turn']();
			}
		};
	};
	
	exports.buyProperty = function (name, price) {
		return {
			id: 'buy-property',
			name: i18n.CHOICE_BUY_PROPERTY.replace('{property}', name).replace('{price}', i18n.formatPrice(price)),
			match: function (visitor) {
				return visitor['buy-property'](name, price);
			}
		};
	};
}());