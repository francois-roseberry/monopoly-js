(function() {
	"use strict";
	
	var FinishTurnChoice = require('./finish-turn-choice');
	var TryDoubleRollChoice = require('./try-double-roll-choice');
	
	var games = require('./sample-games');
	
	describe('A TryDoubleRoll Choice', function () {
		var choice;
		
		beforeEach(function () {
			choice = TryDoubleRollChoice.newChoice();
		});
		
		it('requires dice', function () {
			expect(choice.requiresDice()).to.be(true);
		});
		
		describe('when computing next state', function () {
			var state;
			
			beforeEach(function () {
				state = games.firstPlayerInJail();
			});
			
			it('if roll is a double, current player becomes un-jailed, ' +
				'move with the result of the dice and other players are the same as before', function () {
				var nextState = choice.computeNextState(state, [1, 1]);
				
				_.each(state.players(), function (player, index) {
					if (index === state.currentPlayerIndex()) {
						expect(nextState.players()[index].jailed()).to.be(false);
						expect(nextState.players()[index].position()).to.eql(12);
					} else {
						expect(player.equals(nextState.players()[index])).to.be(true);
					}
				});
			});
			
			it('if roll is not a double, all players are the same as before and the FinishTurnChoice is offered',
				function () {
				var nextState = choice.computeNextState(state, [1, 2]);
				
				_.each(state.players(), function (player, index) {
					expect(player.equals(nextState.players()[index])).to.be(true);					
				});
				
				expect(nextState.choices().length).to.eql(1);
				expect(nextState.choices()[0].equals(FinishTurnChoice.newChoice()));
			});
		});
	});
}());