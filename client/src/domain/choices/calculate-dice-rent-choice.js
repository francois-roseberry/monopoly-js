(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var GameState = require('./game-state');
	var Player = require('./player');
	var Choices = require('./choices');
	
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
		precondition(GameState.isGameState(state),
			'To compute next state, a roll-dice choice requires the actual state');
		precondition(dice, 'To compute next state, a roll-dice choice requires the result of a dice roll');
		
		var rent = this._multiplier * (dice[0] + dice[1]);
		var currentPlayer = state.currentPlayer();
		
		return state.changeChoices(Choices.rentChoices(rent, currentPlayer, this._toPlayer));
	};
}());