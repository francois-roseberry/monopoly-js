(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var GameState = require('./game-state');
	
	var precondition = require('./contract').precondition;
	
	exports.newChoice = function() {
		return new GoToJailChoice();
	};
	
	function GoToJailChoice() {
		this.id = 'finish-turn';
		this.name = i18n.CHOICE_GO_TO_JAIL;
	}
	
	GoToJailChoice.prototype.equals = function (other) {
		return (other instanceof GoToJailChoice);
	};
	
	GoToJailChoice.prototype.requiresDice = function () {
		return false;
	};
	
	GoToJailChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'GoToJailChoice requires a game state to compute the next one');
			
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return player.jail();
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