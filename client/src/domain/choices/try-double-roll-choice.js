(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var GameState = require('./game-state');
	
	var precondition = require('./contract').precondition;
	
	exports.newChoice = function() {
		return new TryDoubleRollChoice();
	};
	
	function TryDoubleRollChoice() {
		this.id = 'try-double-roll';
		this.name = i18n.CHOICE_TRY_DOUBLE_ROLL;
	}
	
	TryDoubleRollChoice.prototype.equals = function (other) {
		return (other instanceof TryDoubleRollChoice);
	};
	
	TryDoubleRollChoice.prototype.requiresDice = function () {
		return true;
	};
	
	TryDoubleRollChoice.prototype.computeNextState = function (state, dice) {
		precondition(GameState.isGameState(state),
			'TryDoubleRollChoice requires a game state to compute the next one');
		precondition(dice,
			'TryDoubleRollChoice requires the result of a dice roll to compute the next state');
			
		if (dice[0] !== dice[1]) {
			return GameState.turnEndState({
				board: state.board(),
				players: state.players(),
				currentPlayerIndex: state.currentPlayerIndex()
			});
		}
		
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return player.unjail().move(dice);
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