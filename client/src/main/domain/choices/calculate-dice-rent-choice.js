(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var PayRentChoice = require('./pay-rent-choice');
	var GoBankruptChoice = require('./go-bankrupt-choice');
	var Player = require('./player');
	
	exports.newChoice = function (multiplier, toPlayer) {
		precondition(_.isNumber(multiplier) && multiplier > 0,
			'Calculate dice rent choice requires a multiplier greater than 0');
		precondition(toPlayer && Player.isPlayer(toPlayer),
			'Calculate dice rent choice requires the player to pay to');
		
		return new CalculateDiceRentChoice(multiplier, toPlayer);
	};
	
	function CalculateDiceRentChoice(multiplier, toPlayer) {
		this.id = 'calculate-dice-rent';
		this.name = i18n.CHOICE_CALCULATE_DICE_RENT.replace('{multiplier}', multiplier);
		this._multiplier = multiplier;
		this._toPlayer = toPlayer;
	}
	
	CalculateDiceRentChoice.prototype.equals = function (other) {
		if (!(other instanceof CalculateDiceRentChoice)) {
			return false;
		}
		
		return this._multiplier === other._multiplier && this._toPlayer.id() === other._toPlayer.id();
	};
	
	CalculateDiceRentChoice.prototype.requiresDice = function () {
		return true;
	};
	
	CalculateDiceRentChoice.prototype.computeNextState = function (state, dice) {
		precondition(state, 'To compute next state, a roll-dice choice requires the actual state');
		precondition(dice, 'To compute next state, a roll-dice choice requires the result of a dice roll');
		
		var rent = this._multiplier * (dice[0] + dice[1]);
		var money = state.players()[state.currentPlayerIndex()].money();
		
		var choice;
		if (rent > money) {
			choice = GoBankruptChoice.newChoice();
		} else {
			choice = PayRentChoice.newChoice(rent, this._toPlayer);
		}
		
		return state.changeChoices([choice]);
	};
}());