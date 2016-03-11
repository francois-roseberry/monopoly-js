(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var GameState = require('./game-state');
	
	exports.newChoice = function() {
		return new RollDiceChoice();
	};
	
	function RollDiceChoice() {
		this.id = 'roll-dice';
		this.name = i18n.CHOICE_ROLL_DICE;
	}
	
	RollDiceChoice.prototype.equals = function (other) {
		return (other instanceof RollDiceChoice);
	};
	
	RollDiceChoice.prototype.requiresDice = function () {
		return true;
	};
	
	RollDiceChoice.prototype.computeNextState = function (state, dice) {
		precondition(GameState.isGameState(state),
			'To compute next state, a roll-dice choice requires the actual state');
		precondition(dice, 'To compute next state, a roll-dice choice requires the result of a dice roll');
		
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return player.move(dice);
			}
			
			return player;
		});
		
		return GameState.turnEndState({
			board: state.board(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex()
		});
	};
}());