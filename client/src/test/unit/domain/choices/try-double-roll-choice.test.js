(function() {
	"use strict";
	
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
			
			it('if roll is a double, current player becomes un-jailed and other players are the same as before',
				function () {
				var nextState = choice.computeNextState(state, [1, 1]);
				
				_.each(state.players(), function (player, index) {
					if (index === state.currentPlayerIndex()) {
						expect(nextState.players()[index].jailed()).to.be(false);
					} else {
						expect(player.equals(nextState.players()[index])).to.be(true);
					}
				});
			});
			
			it('if roll is not a double, state stays the same', function () {
				var nextState = choice.computeNextState(state, [1, 2]);
				
				expect(nextState.equals(state)).to.be(true);
			});
		});
	});
}());