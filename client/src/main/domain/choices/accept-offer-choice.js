(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var GameState = require('./game-state');
	
	exports.newChoice = function () {
		return new AcceptOfferChoice();
	};
	
	function AcceptOfferChoice() {
		this.id = 'accept-offer';
		this.name = i18n.ACCEPT_OFFER;
	}
	
	AcceptOfferChoice.prototype.equals = function (other) {
		if (!(other instanceof AcceptOfferChoice)) {
			return false;
		}
		
		return true;
	};
	
	AcceptOfferChoice.prototype.requiresDice = function () {
		return false;
	};
	
	AcceptOfferChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'RejectOfferChoice requires a game state to compute the next one');
		
		return state;
	};
}());