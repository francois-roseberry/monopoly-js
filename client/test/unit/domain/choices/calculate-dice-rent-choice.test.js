(function() {
	"use strict";
	
	var CalculateDiceRentChoice = require('./calculate-dice-rent-choice');
	var PayRentChoice = require('./pay-rent-choice');
	var GoBankruptChoice = require('./go-bankrupt-choice');
	
	var testData = require('./test-data');
	var games = require('./sample-games');
	
	describe('A CalculateDiceRent Choice', function () {
		it('requires dice', function () {
			var players = testData.players();
			var choice = CalculateDiceRentChoice.newChoice(2, players[0], players[1]);
			
			expect(choice.requiresDice()).to.be(true);
		});
		
		describe('when computing next state', function () {
			it('if current player has enough money, offers to pay the rent', function () {
				var state = games.playerOnCompanyOwnedByOther();
				
				var nextChoices = state.choices()[0].computeNextState(state, [1, 1]).choices();
				
				expect(nextChoices.length).to.eql(1);
				expect(nextChoices[0].equals(PayRentChoice.newChoice(8, state.players()[1]))).to.be(true);
			});
			
			it('if current player cannot afford, offers bankruptcy', function () {
				var state = games.playerBrokeOnCompanyOwnedByOther();
				
				var nextChoices = state.choices()[0].computeNextState(state, [1, 1]).choices();
				
				expect(nextChoices.length).to.eql(1);
				expect(nextChoices[0].equals(GoBankruptChoice.newChoice())).to.be(true);
			});
		});
	});
}());