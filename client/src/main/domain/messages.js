(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	
	exports.logDiceRoll = function (player, die1, die2) {
		var message = i18n.LOG_DICE_ROLL
					.replace('{player}', player)
					.replace('{die1}', die1)
					.replace('{die2}', die2);
						
		return new Log('dice-roll', message);
	};
	
	exports.logDoubleDiceRoll = function (player, dice) {
		var message = i18n.LOG_DOUBLE_DICE_ROLL
						.replace('{player}', player)
						.replace('{dice}', dice);
						
		return new Log('double-dice-roll', message);
	};
	
	exports.logPropertyBought = function (player, property) {
		var message = i18n.LOG_PROPERTY_BOUGHT
						.replace('{player}', player)
						.replace('{property}', property);
						
		return new Log('property-bought', message);
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