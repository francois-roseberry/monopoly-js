(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var GameState = require('./game-state');
	var TradeOffer = require('./trade-offer');
	var Player = require('./player');
	
	exports.newChoice = function (player) {
		precondition(Player.isPlayer(player), 'A TradeChoice requires a player to trade with');
		
		return new TradeChoice(player);
	};
	
	function TradeChoice(player) {
		this.id = 'trade-with-' + player.id();
		this.name = i18n.CHOICE_TRADE.replace('{player}', player.name());
		this._player = player;
	}
	
	TradeChoice.prototype.equals = function (other) {
		if (!(other instanceof TradeChoice)) {
			return false;
		}
		
		return this._player.equals(other._player);
	};
	
	TradeChoice.prototype.requiresDice = function () {
		return false;
	};
	
	TradeChoice.prototype.requiresTrade = function () {
		return true;
	};
	
	TradeChoice.prototype.otherPlayer = function () {
		return this._player;
	};
	
	TradeChoice.prototype.computeNextState = function (state, offer) {
		precondition(GameState.isGameState(state),
			'TradeChoice requires a game state to compute the next one');
		precondition(TradeOffer.isOffer(offer), 'TradeChoice requires a game offer');
		
		if (offer.isEmpty()) {
			return state;
		}
		
		return GameState.gameInTradeState(state.board(), state.players(), offer);
	};
}());