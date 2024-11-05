(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var GameState = require('./game-state');
	
	var precondition = require('./contract').precondition;
	
	exports.newChoice = function (amount) {
		precondition(_.isNumber(amount) && amount > 0,
			'A Pay Deposit Choice requires an amount greater than 0');
			
		return new PayDepositChoice(amount);
	};
	
	function PayDepositChoice(amount) {
		this.id = 'pay-deposit';
		this._amount = amount;
		this.name = i18n.CHOICE_PAY_DEPOSIT.replace('{money}', i18n.formatPrice(amount));
	}
	
	PayDepositChoice.prototype.equals = function (other) {
		return (other instanceof PayDepositChoice);
	};
	
	PayDepositChoice.prototype.requiresDice = function () {
		return false;
	};
	
	PayDepositChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'PayDepositChoice requires a game state to compute the next one');
			
		var amount = this._amount;
			
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return player.unjail().pay(amount);
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