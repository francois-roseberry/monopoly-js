(function() {
	"use strict";
	
	var TradeChoice = require('./trade-choice');
	
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
			
			it('stays the same', function () {
				var previousMoney = state.currentPlayer().money();
				var currentMoney = nextState.currentPlayer().money();
				
				expect(currentMoney).to.eql(previousMoney);
			});
		});
	});
}());