(function() {
	"use strict";
	
	var PayTaxChoice = require('./pay-tax-choice');
	
	var games = require('./sample-games');
	
	describe('A Pay tax Choice', function () {
		var choice;
		var tax;
		var state;
		
		beforeEach(function () {
			tax = 100;
			state = games.turnStart();
			choice = PayTaxChoice.newChoice(tax);
		});
		
		it('does not require dice', function () {
			expect(choice.requiresDice()).to.be(false);
		});
		
		describe('when computing next state', function () {
			var nextState;
			
			beforeEach(function () {
				nextState = choice.computeNextState(state);
			});
			
			it('the rent is subtracted from the money of the current player', function () {
				var previousMoney = state.currentPlayer().money();
				var currentMoney = nextState.currentPlayer().money();
				
				expect(currentMoney).to.eql(previousMoney - tax);
			});
		});
	});
}());