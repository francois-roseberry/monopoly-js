(function() {
	"use strict";
	
	var PayRentChoice = require('./pay-rent-choice');
	
	var games = require('./sample-games');
	
	describe('A Pay rent Choice', function () {
		var choice;
		var rent;
		var owner;
		var state;
		
		beforeEach(function () {
			rent = 100;
			state = games.turnStart();
			owner = state.players()[state.currentPlayerIndex() + 1];
			choice = PayRentChoice.newChoice(rent, owner);
		});
		
		it('does not require dice', function () {
			expect(choice.requiresDice()).to.be(false);
		});
		
		describe('when computing next state', function () {
			var nextState;
			
			beforeEach(function () {
				nextState = choice.computeNextState(state);
			});
			
			it('the rent is subtracted from the money of the current player', function () {
				var previousMoney = state.currentPlayer().money();
				var currentMoney = nextState.currentPlayer().money();
				
				expect(currentMoney).to.eql(previousMoney - rent);
			});
			
			it('the rent is added to the money of the owner', function () {
				var previousMoney = owner.money();
				var money = getPlayerById(nextState, owner.id()).money();
				
				expect(money).to.eql(previousMoney + rent);
			});
			
			function getPlayerById(state, playerId) {
				return _.find(state.players(), function (player) {
					return player.id() === playerId;
				});
			}
		});
	});
}());