(function() {
	"use strict";
	
	var RollDiceChoice = require('./roll-dice-choice');
	var FinishTurnChoice = require('./finish-turn-choice');
	var BuyPropertyChoice = require('./buy-property-choice');
	var PayRentChoice = require('./pay-rent-choice');
	var GoBankruptChoice = require('./go-bankrupt-choice');

	exports.rollDice = function () {
		return RollDiceChoice.newChoice();
	};
	
	exports.finishTurn = function () {
		return FinishTurnChoice.newChoice();
	};
	
	exports.buyProperty = function (property) {
		return BuyPropertyChoice.newChoice(property);
	};
	
	exports.payRent = function (rent, toPlayerId, toPlayerName) {
		return PayRentChoice.newChoice(rent, toPlayerId, toPlayerName);
	};
	
	exports.goBankrupt = function () {
		return GoBankruptChoice.newChoice();
	};
}());