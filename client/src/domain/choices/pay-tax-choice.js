(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var GameState = require('./game-state');
	
	exports.newChoice = function (amount) {
		precondition(_.isNumber(amount) && amount > 0, 'A PayTaxChoice requires a tax greater than 0');
		
		var name = i18n.CHOICE_PAY_TAX.replace('{amount}', i18n.formatPrice(amount));
		return new PayTaxChoice(amount, name);
	};
	
	function PayTaxChoice(amount, name) {
		this.id = 'pay-tax';
		this.name = name;
		this._amount = amount;
	}
	
	PayTaxChoice.prototype.equals = function (other) {
		if (!(other instanceof PayTaxChoice)) {
			return false;
		}
		
		return this._amount === other._amount;
	};
	
	PayTaxChoice.prototype.requiresDice = function () {
		return false;
	};
	
	PayTaxChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'PayTaxChoice requires a game state to compute the next one');
			
		var amount = this._amount;
		
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return player.pay(amount);
			}
			
			return player;
		});
		
		return GameState.turnEndStateAfterPay({
			board: state.board(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex()
		});
	};
}());