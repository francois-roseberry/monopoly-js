(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	exports.logDiceRoll = function (player, die1, die2) {
		precondition(_.isString(player) && player.length > 0,
			'A log about dice roll requires the name of the player who rolled the dice');
		precondition(_.isNumber(die1) && die1 >= 1 && die1 <= 6,
			'A log about dice roll requires a first die between 1 and 6');
		precondition(_.isNumber(die2) && die2 >= 1 && die2 <= 6,
			'A log about dice roll requires a first die between 1 and 6');
		
		var message = i18n.LOG_DICE_ROLL
					.replace('{player}', player)
					.replace('{die1}', die1)
					.replace('{die2}', die2);
						
		return new Log('dice-roll', message);
	};
	
	exports.logDoubleDiceRoll = function (player, dice) {
		precondition(_.isString(player) && player.length > 0,
			'A log about double dice roll requires the name of the player who rolled the dice');
		precondition(_.isNumber(dice) && dice >= 1 && dice <= 6,
			'A log about dice roll requires a first die between 1 and 6');
		
		var message = i18n.LOG_DOUBLE_DICE_ROLL
						.replace('{player}', player)
						.replace('{dice}', dice);
						
		return new Log('double-dice-roll', message);
	};
	
	exports.logPropertyBought = function (player, property) {
		precondition(_.isString(player) && player.length > 0,
			'A log about property bought requires the name of the player who bought');
		precondition(_.isString(property) && property.length > 0,
			'A log about property bought requires the name of the property that was bought');
		
		var message = i18n.LOG_PROPERTY_BOUGHT
						.replace('{player}', player)
						.replace('{property}', property);
						
		return new Log('property-bought', message);
	};
	
	exports.logRentPaid = function (amount, fromPlayer, toPlayer) {
		precondition(_.isNumber(amount) && amount > 0,
			'A log about rent paid requires an amount greater than 0');
		precondition(_.isString(fromPlayer) && fromPlayer.length > 0,
			'A log about rent paid requires the name of the player who paid');
		precondition(_.isString(toPlayer) && toPlayer.length > 0,
			'A log about rent paid requires the name of the player who received the payment');
		
		var message = i18n.LOG_RENT_PAID
						.replace('{amount}', i18n.formatPrice(amount))
						.replace('{fromPlayer}', fromPlayer)
						.replace('{toPlayer}', toPlayer);
		
		return new Log('rent-paid', message);
	};
	
	exports.simpleLog = function () {
		return new Log('simple', 'A message');
	};
	
	function Log(id, message) {
		this._id = id;
		this._message = message;
	}
	
	Log.prototype.id = function () {
		return this._id;
	};
	
	Log.prototype.message = function () {
		return this._message;
	};
}());