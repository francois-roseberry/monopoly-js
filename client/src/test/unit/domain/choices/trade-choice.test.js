(function() {
	"use strict";
	
	var TradeChoice = require('./trade-choice');
	var TradeOffer = require('./trade-offer');
	var RejectOfferChoice = require('./reject-offer-choice');
	var AcceptOfferChoice = require('./accept-offer-choice');
	
	var games = require('./sample-games');
	
	describe('A Trade Choice', function () {
		var choice;
		var state;
		
		beforeEach(function () {
			state = games.turnStart();
			var secondPlayer = state.players()[state.currentPlayerIndex() + 1];
			choice = TradeChoice.newChoice(secondPlayer);
		});
		
		it('does not require dice', function () {
			expect(choice.requiresDice()).to.be(false);
		});
		
		describe('when computing next state', function () {
			describe('when offer is not empty', function () {
				var nextState;
				var offer;
				
				beforeEach(function () {
					offer = TradeOffer.newOffer([
						{
							player: state.players()[0],
							properties: [],
							money: 1
						},
						{
							player: state.players()[1],
							properties: [],
							money: 1
						}
					]);
					nextState = choice.computeNextState(state, offer);
				});
				
				it('offers the AcceptOffer and RejectOffer choices', function () {
					var rejectOffer = RejectOfferChoice.newChoice(offer.currentPlayerId());
					
					expect(nextState.choices().length).to.eql(2);
					expect(nextState.choices()[0].equals(AcceptOfferChoice.newChoice(offer))).to.be(true);
					expect(nextState.choices()[1].equals(rejectOffer)).to.be(true);					
				});
				
				it('current player is now the other player in the offer', function () {
					expect(nextState.currentPlayerIndex()).to.eql(1);
				});
			});
			
			it('if offer is empty, stays the same', function () {
				var nextState = choice.computeNextState(state, TradeOffer.emptyOffer());
				
				expect(nextState.equals(state)).to.be(true);
			});
		});
	});
}());