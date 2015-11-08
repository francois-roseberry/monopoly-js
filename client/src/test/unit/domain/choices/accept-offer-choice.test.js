(function() {
	"use strict";
	
	var AcceptOfferChoice = require('./accept-offer-choice');
	
	var games = require('./sample-games');
	
	describe('An AcceptOffer Choice', function () {
		var choice;
		var state;
		
		beforeEach(function () {
			state = games.turnStart();
			choice = AcceptOfferChoice.newChoice();
		});
		
		it('does not require dice', function () {
			expect(choice.requiresDice()).to.be(false);
		});
		
		describe('when computing next state', function () {
			var nextState;
			
			beforeEach(function () {
				nextState = choice.computeNextState(state);
			});
			
			it('stays the same', function () {
				expect(nextState.equals(state)).to.be(true);
			});
		});
	});
}());