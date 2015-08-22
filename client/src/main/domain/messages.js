(function() {
	"use strict";
	
	exports.logDiceRoll = function (player, die1, die2) {
		var message = '{player} a obtenu un {die1} et un {die2}'
					.replace('{player}', player)
					.replace('{die1}', die1)
					.replace('{die2}', die2);
						
		return new Log('dice-roll', message);
	};
	
	exports.logDoubleDiceRoll = function (player, dice) {
		var message = '{player} a obtenu un doublé de {dice}'
						.replace('{player}', player)
						.replace('{dice}', dice);
						
		return new Log('double-dice-roll', message);
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