(function() {
	"use strict";
	
	var MoveChoice = require('./move-choice');
	
	var games = require('./sample-games');
	
	describe('A Move Choice', function () {
		var choice;
		
		beforeEach(function () {
			choice = MoveChoice.newChoice();
		});
		
		it('requires dice', function () {
			expect(choice.requiresDice()).to.be(true);
		});
		
		describe('when computing next state', function () {
			it('current player has moved', function () {
				var state = choice.computeNextState(games.turnStart(), [0, 2]);
				
				var position = state.currentPlayer().position();
				
				expect(position).to.eql(2);
			});
		});
	});
}());