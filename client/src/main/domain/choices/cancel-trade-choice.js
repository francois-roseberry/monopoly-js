(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var GameState = require('./game-state');
	
	exports.newChoice = function () {
		return new CancelTradeChoice();
	};
	
	function CancelTradeChoice() {
		this.id = 'cancel-trade';
		this.name = i18n.CANCEL_TRADE;
	}
	
	CancelTradeChoice.prototype.equals = function (other) {
		if (!(other instanceof CancelTradeChoice)) {
			return false;
		}
		
		return true;
	};
	
	CancelTradeChoice.prototype.requiresDice = function () {
		return false;
	};
	
	CancelTradeChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'CancelTradeChoice requires a game state to compute the next one');
		
		return state.restoreChoices();
	};
}());