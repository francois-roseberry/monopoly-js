(function() {
	"use strict";
	
	var RejectOfferChoice = require('./reject-offer-choice');
	
	var games = require('./sample-games');
	
	describe('An RejectOffer Choice', function () {
		var choice;
		var state;
		var offerCurrentPlayerId;
		
		beforeEach(function () {
			state = games.turnStart();
			offerCurrentPlayerId = state.players()[1].id();
			choice = RejectOfferChoice.newChoice(offerCurrentPlayerId);
		});
		
		it('does not require dice', function () {
			expect(choice.requiresDice()).to.be(false);
		});
		
		describe('when computing next state', function () {
			var nextState;
			
			beforeEach(function () {
				nextState = choice.computeNextState(state);
			});
			
			it('current player becomes offer current player', function () {
				expect(nextState.currentPlayer().id()).to.eql(offerCurrentPlayerId);
			});
		});
	});
}());