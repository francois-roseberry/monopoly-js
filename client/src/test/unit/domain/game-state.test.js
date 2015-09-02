(function() {
	"use strict";
	
	var GameState = require('./game-state');
	var Board = require('./board');
	var Choices = require('./choices');
	
	var testData = require('./test-data');
	
	describe('A turnStart state', function () {
		it('offers the roll-dice choice', function () {
			var state = GameState.turnStartState({
				squares: Board.squares(),
				players: testData.players(),
				currentPlayerIndex: 0
			});
			
			expect(toChoiceIds(state.choices())).to.contain(Choices.rollDice().id);
		});
	});
	
	describe('A turnEnd state', function () {
		it('offers the finish-turn choice', function () {
			var state = GameState.turnEndState({
				squares: Board.squares(),
				players: testData.players(),
				currentPlayerIndex: 0
			});
			
			expect(toChoiceIds(state.choices())).to.contain(Choices.finishTurn().id);
		});
	});
	
	function toChoiceIds(choices) {
		return _.map(choices, function (choice) {
				return choice.id;
			});
	}
}());