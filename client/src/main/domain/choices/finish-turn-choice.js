(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var GameState = require('./game-state');
	
	var precondition = require('./contract').precondition;
	
	exports.newChoice = function() {
		return new FinishTurnChoice();
	};
	
	function FinishTurnChoice() {
		this.id = 'finish-turn';
		this.name = i18n.CHOICE_FINISH_TURN;
	}
	
	FinishTurnChoice.prototype.equals = function (other) {
		return (other instanceof FinishTurnChoice);
	};
	
	FinishTurnChoice.prototype.requiresDice = function () {
		return false;
	};
	
	FinishTurnChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'FinishTurnChoice requires a game state to compute the next one');
			
		return GameState.turnStartState({
			board: state.board(),
			players: state.players(),
			currentPlayerIndex: (state.currentPlayerIndex() + 1) % state.players().length
		});
	};
}());