(function() {
	"use strict";
	
	var FinishTurnChoice = require('./finish-turn-choice');
	
	var games = require('./sample-games');
	
	describe('A Finish turn Choice', function () {
		var choice;
		
		beforeEach(function () {
			choice = FinishTurnChoice.newChoice();
		});
		
		it('does not require dice', function () {
			expect(choice.requiresDice()).to.be(false);
		});
		
		describe('when computing next state', function () {
			it('switch to the next player', function () {
				var state = choice.computeNextState(games.turnStart());
				
				expect(state.currentPlayerIndex()).to.eql(1);
			});
			
			it('if all players have finished their turn, switch to the first one', function () {
				var state = games.turnStart();
				for (var i = 0; i < state.players().length; i++) {
					state = choice.computeNextState(state);
				}
				
				expect(state.currentPlayerIndex()).to.eql(0);
			});
		});
	});
}());