(function() {
	"use strict";
	
	var PlayGameTask = require('./play-game-task');
	var Board = require('./board');
	var PlayerColors = require('./player-colors').colors();
	var MoveChoice = require('./move-choice');
	var FinishTurnChoice = require('./finish-turn-choice');
	var TradeChoice = require('./trade-choice');
	
	var testData = require('./test-data');
	
	describe('The PlayGame task', function () {
		var task;
		var currentState;
		
		beforeEach(function () {
			task = gameTaskWithCheatedDice(1);
			task.gameState().subscribe(function (state) {
				currentState = state;
			});
		});
		
		it('at start, sends an event with the initial game state', function (done) {
			assertInitialGameState(task.gameState(), done);
		});
		
		it('when turn starts, sends the gameState with the roll-dice-choice', function (done) {
			assertRollDiceChoice(task.gameState(), done);
		});
		
		it('has a messages observable', function () {
			expect(task.messages()).to.not.be(undefined);
		});
		
		it('has a HandleChoicesTask', function () {
			expect(task.handleChoicesTask()).to.not.be(undefined);
		});
		
		it('stopping the task sends an event', function (done) {
			task.stop();
			
			task.completed().subscribe(_.noop, done, done);
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
		
		it('when game in trade, starts a trade task', function (done) {
			task.tradeTaskCreated().take(1).subscribe(_.noop, done, done);
			
			task.handleChoicesTask().makeChoice(TradeChoice.newChoice(currentState.players()[1]));
		});
		
		function assertRollDiceChoice(gameState, done) {
			gameState.take(1)
				.map(onlyChoices)
				.map(toChoiceIds)
				.subscribe(function (choices) {
					expect(choices).to.contain(MoveChoice.newChoice().id);
				}, done, done);
		}
		
		function onlyChoices(state) {
			return state.choices();
		}
		
		function gameTaskWithCheatedDice(dieValue) {
			return PlayGameTask.start({ squares: Board.squares(), players: testData.playersConfiguration(), options: { 
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
		
		function assertInitialGameState(gameState, done) {
			gameState.take(1).subscribe(function (state) {
				expect(state.squares().length).to.eql(Board.squares().length);
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
			}, done, done);
		}
	});
}());