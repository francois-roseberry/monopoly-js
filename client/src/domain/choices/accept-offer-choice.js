(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var GameState = require('./game-state');
	var TradeOffer = require('./trade-offer');
	
	exports.newChoice = function (offer) {
		precondition(TradeOffer.isOffer(offer), 'An AcceptOfferChoice requires an offer');
		
		return new AcceptOfferChoice(offer);
	};
	
	function AcceptOfferChoice(offer) {
		this.id = 'accept-offer';
		this.name = i18n.CHOICE_ACCEPT_OFFER;
		this._offer = offer;
	}
	
	AcceptOfferChoice.prototype.equals = function (other) {
		if (!(other instanceof AcceptOfferChoice)) {
			return false;
		}
		
		if (!this._offer.equals(other._offer)) {
			return false;
		}
		
		return true;
	};
	
	AcceptOfferChoice.prototype.requiresDice = function () {
		return false;
	};
	
	AcceptOfferChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'AcceptOfferChoice requires a game state to compute the next one');
		
		var self = this;
		var playerIndex = _.findIndex(state.players(), function (player) {
			return player.id() === self._offer.currentPlayerId();
		});
		
		precondition(playerIndex >= 0, 'Offer accepted must have been made by a valid player');
		
		var newPlayers = _.map(state.players(), function (player) {
			if (player.id() === self._offer.currentPlayerId()) {
				return transferPossessionsInOffer(player, self._offer, 0, 1);
			}
			
			if (player.id() === self._offer.otherPlayerId()) {
				return transferPossessionsInOffer(player, self._offer, 1, 0);
			}
			
			return player;
		});
		
		return GameState.turnStartState({
			board: state.board(),
			players: newPlayers,
			currentPlayerIndex: playerIndex
		});
	};
	
	function transferPossessionsInOffer(player, offer, playerIndexFrom, playerIndexTo) {
		var newPlayer = player.pay(offer.moneyFor(playerIndexFrom))
			.earn(offer.moneyFor(playerIndexTo));
		
		newPlayer = _.reduce(offer.propertiesFor(playerIndexFrom), function (newPlayer, property) {
			return newPlayer.loseProperty(property);
		}, newPlayer);
		
		newPlayer = _.reduce(offer.propertiesFor(playerIndexTo), function (newPlayer, property) {
			return newPlayer.gainProperty(property);
		}, newPlayer);
		
		return newPlayer;
	}
}());