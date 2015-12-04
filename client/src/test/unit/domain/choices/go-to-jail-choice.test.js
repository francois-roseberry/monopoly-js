(function() {
	"use strict";
	
	var GoToJailChoice = require('./go-to-jail-choice');
	var PayDepositChoice = require('./pay-deposit-choice');
	var TryDoubleRollChoice = require('./try-double-roll-choice');
	
	var games = require('./sample-games');
	
	describe('A Go To Jail Choice', function () {
		var choice;
		
		beforeEach(function () {
			choice = GoToJailChoice.newChoice();
		});
		
		it('does not require dice', function () {
			expect(choice.requiresDice()).to.be(false);
		});
		
		describe('when computing next state', function () {
			var state;
			var nextState;
			
			beforeEach(function () {
				state = games.turnStart();
				nextState = choice.computeNextState(state);
			});
			
			it('current player becomes jailed and other players are the same as before', function () {
				_.each(state.players(), function (player, index) {
					if (index === state.currentPlayerIndex()) {
						expect(nextState.players()[index].jailed()).to.be(true);
					} else {
						expect(player.equals(nextState.players()[index])).to.be(true);
					}
				});
			});
			
			it('offers the PayDepositChoice and the TryDoubleRollChoice', function () {
				expect(nextState.choices().length).to.eql(2);
				expect(nextState.choices()[0].equals(PayDepositChoice.newChoice())).to.be(true);
				expect(nextState.choices()[1].equals(TryDoubleRollChoice.newChoice())).to.be(true);
			});
		});
	});
}());