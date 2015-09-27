(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var GameState = require('./game-state');
	
	exports.newChoice = function (amount) {
		precondition(_.isNumber(amount) && amount > 0, 'A PayTaxChoice requires a tax greater than 0');
		
		return new PayTaxChoice(amount);
	};
	
	function PayTaxChoice(amount) {
		this.id = 'pay-tax';
		this.name = i18n.CHOICE_PAY_TAX.replace('{amount}', i18n.formatPrice(amount));
		this._amount = amount;
	}
	
	PayTaxChoice.prototype.equals = function (other) {
		if (!(other instanceof PayTaxChoice)) {
			return false;
		}
		
		var self = this;
		return other.match({
			'pay-tax': function (amount) {
				return self._amount === amount;
			}
		});
	};
	
	PayTaxChoice.prototype.match = function (visitor) {
		return visitor[this.id](this._amount);
	};
	
	PayTaxChoice.prototype.requiresDice = function () {
		return false;
	};
	
	PayTaxChoice.prototype.computeNextState = function (state) {
		var amount = this._amount;
		
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return player.pay(amount);
			}
			
			return player;
		});
		
		return GameState.turnEndState({
			squares: state.squares(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex()
		}, true);
	};
}());