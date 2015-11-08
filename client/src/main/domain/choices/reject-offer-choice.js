(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var GameState = require('./game-state');
	
	exports.newChoice = function () {
		return new RejectOfferChoice();
	};
	
	function RejectOfferChoice() {
		this.id = 'reject-offer';
		this.name = i18n.REJECT_OFFER;
	}
	
	RejectOfferChoice.prototype.equals = function (other) {
		if (!(other instanceof RejectOfferChoice)) {
			return false;
		}
		
		return true;
	};
	
	RejectOfferChoice.prototype.requiresDice = function () {
		return false;
	};
	
	RejectOfferChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'RejectOfferChoice requires a game state to compute the next one');
		
		return state;
	};
}());