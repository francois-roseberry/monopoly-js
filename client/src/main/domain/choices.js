(function() {
	"use strict";
	
	var RollDiceChoice = require('./roll-dice-choice');
	var FinishTurnChoice = require('./finish-turn-choice');
	var BuyPropertyChoice = require('./buy-property-choice');
	var PayRentChoice = require('./pay-rent-choice');
	var GoBankruptChoice = require('./go-bankrupt-choice');
	var PayTaxChoice = require('./pay-tax-choice');
	var ChooseTaxTypeChoice = require('./choose-tax-type-choice');
	var CalculateDiceRentChoice = require('./calculate-dice-rent-choice');

	exports.rollDice = function () {
		return RollDiceChoice.newChoice();
	};
	
	exports.finishTurn = function () {
		return FinishTurnChoice.newChoice();
	};
	
	exports.buyProperty = function (property) {
		return BuyPropertyChoice.newChoice(property);
	};
	
	exports.payRent = function (rent, toPlayer) {
		return PayRentChoice.newChoice(rent, toPlayer);
	};
	
	exports.goBankrupt = function () {
		return GoBankruptChoice.newChoice();
	};
	
	exports.payTax = function (amount) {
		return PayTaxChoice.newChoice(amount);
	};
	
	exports.chooseFlatTax = function (amount) {
		return ChooseTaxTypeChoice.newFlatTax(amount);
	};
	
	exports.choosePercentageTax = function (percentage, amount) {
		return ChooseTaxTypeChoice.newPercentageTax(percentage, amount);
	};
	
	exports.calculateDiceRent = function (multiplier, toPlayer) {
		return CalculateDiceRentChoice.newChoice(multiplier, toPlayer);
	};
}());