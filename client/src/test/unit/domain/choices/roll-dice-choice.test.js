(function() {
	"use strict";
	
	var RollDiceChoice = require('./roll-dice-choice');
	
	var games = require('./sample-games');
	
	describe('A CalculateDiceRent Choice', function () {
		var choice;
		
		beforeEach(function () {
			choice = RollDiceChoice.newChoice();
		});
		
		it('requires dice', function () {
			expect(choice.requiresDice()).to.be(true);
		});
		
		describe('when computing next state', function () {
			it('current player has moved', function () {
				var state = choice.computeNextState(games.turnStart(), [0, 2]);
				
				var position = state.players()[state.currentPlayerIndex()].position();
				
				expect(position).to.eql(2);
			});
		});
	});
}());