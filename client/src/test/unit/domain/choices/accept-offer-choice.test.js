(function() {
	"use strict";
	
	var AcceptOfferChoice = require('./accept-offer-choice');
	var TradeOffer = require('./trade-offer');
	
	var games = require('./sample-games');
	
	describe('An AcceptOffer Choice', function () {
		var choice;
		var state;
		var offer;
		
		beforeEach(function () {
			state = games.turnStartWithSomePropertiesOwned();
			offer = TradeOffer.newOffer([
				{
					playerId: state.players()[1].id(),
					properties: [state.players()[1].properties()[0].id()],
					money: 1
				},
				{
					playerId: state.players()[0].id(),
					properties: [state.players()[0].properties()[0].id()],
					money: 2
				}
			]);
			choice = AcceptOfferChoice.newChoice(offer);
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
				expect(nextState.currentPlayer().id()).to.eql(offer.currentPlayerId());
			});
			
			it('current player lost the money he offered and gained the money the other offered', function () {
				var newMoney = state.players()[1].money() - offer.moneyFor(0) + offer.moneyFor(1);
				
				expect(nextState.currentPlayer().money()).to.eql(newMoney);
			});
			
			it('other player lost the money he offered and gained the money the current offered', function () {
				var newMoney = state.players()[0].money() - offer.moneyFor(1) + offer.moneyFor(0);
				
				expect(nextState.players()[0].money()).to.eql(newMoney);
			});
		});
	});
}());