(function() {
	"use strict";
	
	var PlayGameTask = require('./play-game-task');
	var Board = require('./board');
	var PlayerColors = require('./player-colors').colors();
	var Choices = require('./choices');
	
	var testPlayers = require('./test-players');
	
	describe('The PlayGame task', function () {
		var task;
		
		beforeEach(function () {
			task = PlayGameTask.start(Board.squares(), testPlayers.PLAYERS, { fastDice: true });
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
		
		it('when roll-dice is chosen, creates a roll-dice-task', function (done) {
			task.rollDiceTaskCreated().take(1).subscribe(function (task) {
				expect(task).to.not.eql(undefined);
			}, done, done);
			
			task.handleChoicesTask().makeChoice(Choices.rollDice());
		});
		
		describe('after dice have finished rolling', function () {
			var newPosition;
			var newChoices;
			
			beforeEach(function (done) {
				task = gameTaskWithCheatedDice(1);
			
				task.gameState().skip(1).take(1)
					.subscribe(function (state) {
						newPosition = state.players[0].position;
						newChoices = toChoiceIds(state.choices);
					}, done, done);
				
				task.handleChoicesTask().makeChoice(Choices.rollDice());
			});
			
			it('send a game state event with the new position', function () {
				expect(newPosition).to.eql(2);
			});
			
			it('send a choices event with the finish-turn choice', function () {
				expect(newChoices).to.eql([Choices.finishTurn().id]);
			});
		});
		
		it('when finish-turn is chosen, sends the new game state with the next player', function (done) {
			task.handleChoicesTask().makeChoice(Choices.finishTurn());
			
			assertCurrentPlayerIsTheSecondOne(task.gameState(), done);
		});
		
		it('when all players have finished their turn, the first one plays again', function (done) {
			finishAllPlayerTurns(testPlayers.PLAYERS, task);
			
			assertCurrentPlayerIsTheFirstOne(task.gameState(), done);
		});
		
		it('when moving past last square, wraps around the board', function (done) {
			task = gameTaskWithCheatedDice(Board.squares().length / 2 + 1);
			
			task.handleChoicesTask().makeChoice(Choices.rollDice());
			
			assertFirstPlayerPosition(task.gameState().skip(1), 2, done);
		});
		
		function assertRollDiceChoice(gameState, done) {
			gameState.take(1)
				.map(onlyChoices)
				.map(toChoiceIds)
				.subscribe(function (choices) {
					expect(choices).to.eql([Choices.rollDice().id]);
				}, done, done);
		}
		
		function onlyChoices(state) {
			return state.choices;
		}
		
		function gameTaskWithCheatedDice(dieValue) {
			return PlayGameTask.start(Board.squares(), testPlayers.PLAYERS, { 
				fastDice: true,
				dieFunction: function () {
					return dieValue;
				}
			});
		}
		
		function assertFirstPlayerPosition(gameState, position, done) {
			gameState.take(1).subscribe(function (state) {
				expect(state.players[0].position).to.eql(position);
			}, done, done);
		}
		
		function toChoiceIds(choices) {
			return _.map(choices, function (choice) {
					return choice.id;
				});
		}
		
		function assertInitialGameState(gameState, done) {
			gameState.take(1).subscribe(function (state) {
				expect(state.squares.length).to.eql(Board.squares().length);
				expect(state.players.length).to.eql(testPlayers.PLAYERS.length);
				_.each(state.players, function (player, index) {
					expect(player.name).to.eql('Joueur ' + (index + 1));
					expect(player.money).to.eql(1500);
					expect(player.position).to.eql(0);
					expect(player.color).to.eql(PlayerColors[index]);
					expect(['human', 'computer']).to.contain(player.type);
				});
				expect(state.currentPlayerIndex).to.eql(0);
				expect(toChoiceIds(state.choices)).to.eql([Choices.rollDice().id]);
			}, done, done);
		}
		
		function finishAllPlayerTurns(players, task) {
			for (var i = 0; i < players.length; i++) {
				task.handleChoicesTask().makeChoice(Choices.finishTurn());
			}
		}
		
		function assertCurrentPlayerIsTheFirstOne(gameState, done) {
			assertCurrentPlayerIndex(gameState, 0, done);
		}
		
		function assertCurrentPlayerIsTheSecondOne(gameState, done) {
			assertCurrentPlayerIndex(gameState, 1, done);
		}
		
		function assertCurrentPlayerIndex(gameState, index, done) {
			gameState.take(1).subscribe(function (state) {
				expect(state.currentPlayerIndex).to.eql(index);
			}, done, done);
		}
	});
}());