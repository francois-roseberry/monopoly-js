(function() {
	"use strict";
	
	var FinishTurnChoice = require('./finish-turn-choice');
	var PayDepositChoice = require('./pay-deposit-choice');
	
	var games = require('./sample-games');
	
	describe('A PayDeposit Choice', function () {
		var choice;
		
		beforeEach(function () {
			choice = PayDepositChoice.newChoice();
		});
		
		it('does not require dice', function () {
			expect(choice.requiresDice()).to.be(false);
		});
		
		describe('when computing next state', function () {
			var state;
			var nextState;
			
			beforeEach(function () {
				state = games.firstPlayerInJail();
				nextState = choice.computeNextState(state);
			});
			
			it('current player becomes un-jailed and other players are the same as before', function () {
				_.each(state.players(), function (player, index) {
					if (index === state.currentPlayerIndex()) {
						expect(nextState.players()[index].jailed()).to.be(false);
					} else {
						expect(player.equals(nextState.players()[index])).to.be(true);
					}
				});
			});
			
			it('current player loses 50$', function () {
				expect(nextState.players()[state.currentPlayerIndex()].money()).to.eql(
					state.players()[state.currentPlayerIndex()].money() - 50);
			});
			
			it('offers only the FinishTurnChoice', function () {
				expect(nextState.choices().length).to.eql(1);
				expect(nextState.choices()[0].equals(FinishTurnChoice.newChoice())).to.be(true);
			});
		});
	});
}());