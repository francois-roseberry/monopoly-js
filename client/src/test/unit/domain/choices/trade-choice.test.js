(function() {
	"use strict";
	
	var TradeChoice = require('./trade-choice');
	var CancelTradeChoice = require('./cancel-trade-choice');
	
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
			var nextState;
			
			beforeEach(function () {
				nextState = choice.computeNextState(state);
			});
			
			it('changes the choices to CancelTrade', function () {
				expect(nextState.choices().length).to.eql(1);
				expect(nextState.choices()[0].equals(CancelTradeChoice.newChoice()));
			});
		});
	});
}());