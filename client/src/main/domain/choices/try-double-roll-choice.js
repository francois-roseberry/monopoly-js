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
		return false;
	};
	
	TryDoubleRollChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'TryDoubleRollChoice requires a game state to compute the next one');
			
		return GameState.turnStartState({
			squares: state.squares(),
			players: state.players(),
			currentPlayerIndex: state.currentPlayerIndex()
		});
	};
}());