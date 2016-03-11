(function() {
	"use strict";
	
	var ChooseTaxTypeChoice = require('./choose-tax-type-choice');
	var PayTaxChoice = require('./pay-tax-choice');
	var GoBankruptChoice = require('./go-bankrupt-choice');
	var GameState = require('./game-state');
	var Board = require('./board');
	
	var testData = require('./test-data');
	
	describe('A ChooseTaxType Choice', function () {
		var choice = ChooseTaxTypeChoice.newFlatTax(1600);
		
		it('does not require dice', function () {
			expect(choice.requiresDice()).to.be(false);
		});
		
		it('percentage tax is always rounded to the nearest integer', function () {
				var choice = ChooseTaxTypeChoice.newPercentageTax(10, 197);
				var state = GameState.turnEndState({
					board: Board.standard(),
					players: testData.players(),
					currentPlayerIndex: 0
				}).changeChoices([choice]);
				
				var nextChoices = state.choices()[0].computeNextState(state).choices();
				
				expect(nextChoices.length).to.eql(1);
				expect(nextChoices[0].equals(PayTaxChoice.newChoice(20))).to.be(true);
			});
		
		describe('when computing next state', function () {
			it('if flat tax was chosen, offers to pay the tax', function () {
				var choice = ChooseTaxTypeChoice.newFlatTax(400);
				var state = GameState.turnEndState({
					board: Board.standard(),
					players: testData.players(),
					currentPlayerIndex: 0
				}).changeChoices([choice]);
				
				var nextChoices = state.choices()[0].computeNextState(state).choices();
				
				expect(nextChoices.length).to.eql(1);
				expect(nextChoices[0].equals(PayTaxChoice.newChoice(400))).to.be(true);
			});
			
			it('if percentage tax was chosen, offers to pay the tax', function () {
				var choice = ChooseTaxTypeChoice.newPercentageTax(10, 2000);
				var state = GameState.turnEndState({
					board: Board.standard(),
					players: testData.players(),
					currentPlayerIndex: 0
				}).changeChoices([choice]);
				
				var nextChoices = state.choices()[0].computeNextState(state).choices();
				
				expect(nextChoices.length).to.eql(1);
				expect(nextChoices[0].equals(PayTaxChoice.newChoice(200))).to.be(true);
			});
			
			it('if current player cannot afford, offers bankruptcy', function () {
				var state = GameState.turnEndState({
					board: Board.standard(),
					players: testData.players(),
					currentPlayerIndex: 0
				}).changeChoices([choice]);
				
				var nextChoices = state.choices()[0].computeNextState(state).choices();
				
				expect(nextChoices.length).to.eql(1);
				expect(nextChoices[0].equals(GoBankruptChoice.newChoice())).to.be(true);
			});
		});
	});
}());