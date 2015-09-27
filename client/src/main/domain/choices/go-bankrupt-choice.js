(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	
	var GameState = require('./game-state');
	
	exports.newChoice = function() {
		return new GoBankruptChoice();
	};
	
	function GoBankruptChoice() {
		this.id = 'go-bankrupt';
		this.name = i18n.CHOICE_GO_BANKRUPT;
	}
	
	GoBankruptChoice.prototype.equals = function (other) {
		return (other instanceof GoBankruptChoice);
	};
	
	GoBankruptChoice.prototype.match = function (visitor) {
		return visitor[this.id]();
	};
	
	GoBankruptChoice.prototype.requiresDice = function () {
		return false;
	};
	
	GoBankruptChoice.prototype.computeNextState = function (state) {
		return goBankruptNextState(state);
	};
	
	function goBankruptNextState(state) {
		var newPlayers = _.filter(state.players(), function (player, index) {
			return index !== state.currentPlayerIndex();
		});
		
		if (newPlayers.length === 1) {
			return GameState.gameFinishedState(state.squares(), newPlayers[0]);
		}
		
		var newPlayerIndex = state.currentPlayerIndex() % newPlayers.length;
		
		return GameState.turnStartState({
			squares: state.squares(),
			players: newPlayers,
			currentPlayerIndex: newPlayerIndex
		});
	}
}());