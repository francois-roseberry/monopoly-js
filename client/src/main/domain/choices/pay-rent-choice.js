(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var Player = require('./player');
	var GameState = require('./game-state');
	
	exports.newChoice = function (rent, toPlayer) {
		precondition(_.isNumber(rent) && rent > 0, 'Pay rent choice requires a rent greater than 0');
		precondition(toPlayer && Player.isPlayer(toPlayer),
			'Pay rent choice requires the player to pay to');
		
		return new PayRentChoice(rent, toPlayer.id(), toPlayer.name());
	};
	
	function PayRentChoice(rent, toPlayerId, toPlayerName) {
		this.id = 'pay-rent';
		this.name = i18n.CHOICE_PAY_RENT.replace('{rent}', i18n.formatPrice(rent)).replace('{toPlayer}', toPlayerName);
		this._rent = rent;
		this._toPlayerId = toPlayerId;
		this._toPlayerName = toPlayerName;
	}
	
	PayRentChoice.prototype.equals = function (other) {
		if (!(other instanceof PayRentChoice)) {
			return false;
		}
		
		return this._rent === other._rent && this._toPlayerId === other._toPlayerId;
	};
	
	PayRentChoice.prototype.requiresDice = function () {
		return false;
	};
	
	PayRentChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'PayRentChoice requires a game state to compute the next one');
			
		var rent = this._rent;
		var toPlayerId = this._toPlayerId;
		
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return player.pay(rent);
			}
			
			if (player.id() === toPlayerId) {
				return player.earn(rent);
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