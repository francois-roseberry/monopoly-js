(function() {
	"use strict";
	
	var TradeChoice = require('./trade-choice');
	var CancelTradeChoice = require('./cancel-trade-choice');
	
	var games = require('./sample-games');
	
	describe('A CancelTrade Choice', function () {
		var choice;
		
		beforeEach(function () {
			choice = CancelTradeChoice.newChoice();
		});
		
		it('does not require dice', function () {
			expect(choice.requiresDice()).to.be(false);
		});
		
		describe('when computing next state', function () {
			var nextState;
			
			beforeEach(function () {
				var state = games.turnStart();
				var secondPlayer = state.players()[state.currentPlayerIndex() + 1];
				state = TradeChoice.newChoice(secondPlayer).computeNextState(state);
				
				nextState = choice.computeNextState(state);
			});
			
			it('restore the turn start choices', function () {
				assertSameChoices(nextState.choices(), games.turnStart().choices());
			});
			
			function assertSameChoices(leftChoices, rightChoices) {
				expect(leftChoices.length).to.eql(rightChoices.length);
				
				_.each(leftChoices, function (choice, index) {
					expect(choice.equals(rightChoices[index])).to.be(true);
				});
			}
		});
	});
}());