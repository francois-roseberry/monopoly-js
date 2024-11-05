(function() {
	"use strict";
	
	var GoBankruptChoice = require('./go-bankrupt-choice');
	var FinishTurnChoice = require('./finish-turn-choice');
	
	var games = require('./sample-games');
	
	describe('A Go Bankrupt Choice', function () {
		var choice;
		
		beforeEach(function () {
			choice = GoBankruptChoice.newChoice();
		});
		
		it('does not require dice', function () {
			expect(choice.requiresDice()).to.be(false);
		});
		
		describe('when computing next state', function () {
			it('current player is removed from game', function () {
				var state = games.turnStart();
				var currentPlayerId = state.currentPlayer().id();
				var nextState = choice.computeNextState(state);
				var playerIds = nextState.players().map(function (player) { return player.id(); });
				
				expect(nextState.players().length).to.eql(state.players().length - 1);
				expect(playerIds).to.not.contain(currentPlayerId);
			});
			
			it('when the last player in the list goes bankrupt, current player becomes the first one', function () {
				var state = games.turnStart();
				for (var i = 0; i < state.players().length - 1; i++) {
					state = FinishTurnChoice.newChoice().computeNextState(state);
				}
				
				state = choice.computeNextState(state);
				
				expect(state.currentPlayerIndex()).to.eql(0);
			});
			
			it('when only one player remains, game is over (no more choices)', function () {
				var state = games.turnStart();
				for (var i = 0; i < state.players().length; i++) {
					state = choice.computeNextState(state);
				}
				
				expect(state.choices().length).to.eql(0);
			});
		});
	});
}());