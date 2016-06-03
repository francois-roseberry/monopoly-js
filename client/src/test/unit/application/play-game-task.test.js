(function() {
	"use strict";
	
	var PlayGameTask = require('./play-game-task');
	var Board = require('./board');
	var PlayerColors = require('./player-colors').colors();
	var MoveChoice = require('./move-choice');
	var FinishTurnChoice = require('./finish-turn-choice');
	var TradeChoice = require('./trade-choice');
	
	var testData = require('./test-data');
	var assert = require('./assert');
	
	describe('The PlayGame task', function () {
		var task;
		var currentState;
		
		beforeEach(function () {
			task = gameTaskWithCheatedDice(1);
			task.gameState().subscribe(function (state) {
				currentState = state;
			});
		});
		
		it('at start, sends an event with the initial game state', function () {
			assertInitialGameState(currentState);
		});
		
		it('when turn starts, sends the gameState with the roll-dice-choice', function () {
			assertRollDiceChoice(currentState);
		});
		
		it('has a messages observable', function () {
			expect(task.messages()).to.be.ok();
		});
		
		it('has a HandleChoicesTask', function () {
			expect(task.handleChoicesTask()).to.be.ok();
		});
		
		it('stops correctly', function () {
			assert.taskStopCorrectly(task, [
				task.messages(),
				task.rollDiceTaskCreated(),
				task.tradeTaskCreated(),
				task.handleChoicesTask().completed()
			]);
		});
		
		describe('when a choice is made, sends the next game state', function () {
			it('if it does not require dice, compute next state from previous one directly', function () {
				var choice = FinishTurnChoice.newChoice();
				var nextState = choice.computeNextState(currentState);
				
				task.handleChoicesTask().makeChoice(choice);
				
				expect(currentState.equals(nextState)).to.eql(true);
			});
			
			it('if it requires dice, compute next state from previous one and dice', function (done) {
				var choice = MoveChoice.newChoice();
				var nextState = choice.computeNextState(currentState, [1, 1]);
				
				task.handleChoicesTask().makeChoice(choice);
				
				task.gameState().skip(1).take(1).subscribe(function (state) {
					expect(state.equals(nextState)).to.eql(true);
				}, done, done);
			});
		});
		
		it('if choice requires trade, starts a trade task', function (done) {
			task.tradeTaskCreated().take(1).subscribe(_.noop, done, done);
			
			task.handleChoicesTask().makeChoice(TradeChoice.newChoice(currentState.players()[1]));
		});
		
		function assertRollDiceChoice(state) {
			var choiceIds = _.map(state.choices(), function (choice) {
				return choice.id;
			});
			
			expect(choiceIds).to.contain(MoveChoice.newChoice().id);
		}
		
		function gameTaskWithCheatedDice(dieValue) {
			return PlayGameTask.start({ board: Board.standard(), players: testData.playersConfiguration(), options: { 
				fastDice: true,
				dieFunction: function () {
					return dieValue;
				}
			}});
		}
		
		function toChoiceIds(choices) {
			return _.map(choices, function (choice) {
					return choice.id;
				});
		}
		
		function assertInitialGameState(state) {
			expect(state.board().equals(testData.gameConfiguration().board)).to.be(true);
			expect(state.players().length).to.eql(testData.playersConfiguration().length);
			_.each(state.players(), function (player, index) {
				expect(player.name()).to.eql('Joueur ' + (index + 1));
				expect(player.money()).to.eql(1500);
				expect(player.position()).to.eql(0);
				expect(player.color()).to.eql(PlayerColors[index]);
				expect(['human', 'computer']).to.contain(player.type());
			});
			expect(state.currentPlayerIndex()).to.eql(0);
			expect(toChoiceIds(state.choices())).to.contain(MoveChoice.newChoice().id);
		}
	});
}());