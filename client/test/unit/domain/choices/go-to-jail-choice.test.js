(function() {
	"use strict";
	
	var GoToJailChoice = require('./go-to-jail-choice');
	var FinishTurnChoice = require('./finish-turn-choice');
	
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
			
			it('offers the FinishTurnChoice', function () {
				expect(nextState.choices().length).to.eql(1);
				expect(nextState.choices()[0].equals(FinishTurnChoice.newChoice())).to.be(true);
			});
		});
	});
}());