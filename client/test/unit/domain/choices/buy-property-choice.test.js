(function() {
	"use strict";
	
	var BuyPropertyChoice = require('./buy-property-choice');
	var Board = require('./board');
	
	var games = require('./sample-games');
	
	describe('A Buy property Choice', function () {
		var choice;
		var property;
		
		beforeEach(function () {
			property = Board.standard().properties().readingRailroad;
			choice = BuyPropertyChoice.newChoice(property);
		});
		
		it('does not require dice', function () {
			expect(choice.requiresDice()).to.be(false);
		});
		
		describe('when computing next state', function () {
			it('the property price is substracted from the money of the current player', function () {
				var state = choice.computeNextState(games.turnStart());
				
				var previousMoney = games.turnStart().players()[state.currentPlayerIndex()].money();
				var currentMoney = state.players()[state.currentPlayerIndex()].money();
				
				expect(currentMoney).to.eql(previousMoney - property.price());
			});
		});
	});
}());