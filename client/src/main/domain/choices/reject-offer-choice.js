(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var GameState = require('./game-state');
	
	exports.newChoice = function (offerCurrentPlayerId) {
		precondition(_.isString(offerCurrentPlayerId), 'A RejectOfferChoice requires an offer current player id');
		
		return new RejectOfferChoice(offerCurrentPlayerId);
	};
	
	function RejectOfferChoice(offerCurrentPlayerId) {
		this.id = 'reject-offer';
		this.name = i18n.CHOICE_REJECT_OFFER;
		this._offerCurrentPlayerId = offerCurrentPlayerId;
	}
	
	RejectOfferChoice.prototype.equals = function (other) {
		if (!(other instanceof RejectOfferChoice)) {
			return false;
		}
		
		if (this._offerCurrentPlayerId !== other._offerCurrentPlayerId) {
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
			
		var self = this;
		var playerIndex = _.findIndex(state.players(), function (player) {
			return player.id() === self._offerCurrentPlayerId;
		});
		
		precondition(playerIndex >= 0, 'Offer rejected must have been made by a valid player');
		
		return GameState.turnStartState({
			board: state.board(),
			players: state.players(),
			currentPlayerIndex: playerIndex
		});
	};
}());