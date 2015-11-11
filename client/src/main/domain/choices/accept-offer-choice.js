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
		this.name = i18n.ACCEPT_OFFER;
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
		
		return state;
	};
}());