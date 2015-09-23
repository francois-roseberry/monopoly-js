(function() {
	"use strict";
	
	var PlayGameTask = require('./play-game-task');
	var Board = require('./board');
	var PlayerColors = require('./player-colors').colors();
	var Choices = require('./choices');
	var Railroad = require('./railroad');
	
	var testData = require('./test-data');
	
	describe('The PlayGame task', function () {
		var task;
		
		beforeEach(function () {
			task = PlayGameTask.start(testData.gameConfiguration());
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
			var newState;
			
			beforeEach(function (done) {
				task = gameTaskWithCheatedDice(1);
			
				task.gameState().skip(1).take(1)
					.subscribe(function (state) {
						newState = state;
					}, done, done);
				
				task.handleChoicesTask().makeChoice(Choices.rollDice());
			});
			
			it('position changes', function () {
				expect(newState.players()[0].position()).to.eql(2);
			});
			
			it('offer the finish-turn choice', function () {
				expect(toChoiceIds(newState.choices())).to.eql([Choices.finishTurn().id]);
			});
		});
		
		it('when finish-turn is chosen, sends the new game state with the next player', function (done) {
			task.handleChoicesTask().makeChoice(Choices.finishTurn());
			
			assertCurrentPlayerIsTheSecondOne(task.gameState(), done);
		});
		
		it('when all players have finished their turn, the first one plays again', function (done) {
			finishAllPlayerTurns(task);
			
			assertCurrentPlayerIsTheFirstOne(task.gameState(), done);
		});
		
		it('when buy-property is chosen, current player loses money', function (done) {
			task.handleChoicesTask().makeChoice(Choices.buyProperty(Railroad.reading()));
			
			assertCurrentPlayerHasLostMoney(task.gameState(), Railroad.reading().price(), done);
		});
		
		it('when pay-rent is chosen, transfer the rent from current player to owner', function (done) {
			var rent = 100;
			var owner = getSecondPlayer(task.gameState());
			task.handleChoicesTask().makeChoice(Choices.payRent(rent, owner.id(), owner.name()));
			
			assertCurrentPlayerHasPaidToOwner(task.gameState(), rent, 1, done);
		});
		
		it('when going bankrupt is chosen, current player is removed from game', function (done) {
			task.handleChoicesTask().makeChoice(Choices.goBankrupt());
			
			assertPlayerHasBeenRemovedFromTheGame(task.gameState(), testData.players()[0].id(), done);
		});
		
		it('when the last player in the list goes bankrupt, current player becomes the first one', function (done) {
			switchToLastPlayerTurn(task);
			
			task.handleChoicesTask().makeChoice(Choices.goBankrupt());
			
			assertCurrentPlayerIsTheFirstOne(task.gameState(), done);
		});
		
		it('when only one player remains, game is over', function (done) {
			killAllPlayersButOne(task);
			
			assertGameIsOver(task.gameState(), done);
		});
		
		function getSecondPlayer(gameState) {
			var player;
			gameState.take(1)
				.subscribe(function (state) {
					player = state.players()[1];
				});
			return player;
		}
		
		function assertRollDiceChoice(gameState, done) {
			gameState.take(1)
				.map(onlyChoices)
				.map(toChoiceIds)
				.subscribe(function (choices) {
					expect(choices).to.eql([Choices.rollDice().id]);
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
				expect(toChoiceIds(state.choices())).to.eql([Choices.rollDice().id]);
			}, done, done);
		}
		
		function finishAllPlayerTurns(task) {
			for (var i = 0; i < testData.playersConfiguration().length; i++) {
				task.handleChoicesTask().makeChoice(Choices.finishTurn());
			}
		}
		
		function killAllPlayersButOne(task) {
			for (var i = 0; i < testData.playersConfiguration().length - 1; i++) {
				task.handleChoicesTask().makeChoice(Choices.goBankrupt());
			}
		}
		
		function switchToLastPlayerTurn(task) {
			for (var i = 0; i < testData.playersConfiguration().length - 1; i++) {
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
				expect(state.currentPlayerIndex()).to.eql(index);
			}, done, done);
		}
		
		function assertCurrentPlayerHasLostMoney(gameState, amount, done) {
			gameState.take(1).subscribe(function (state) {
				expect(state.players()[state.currentPlayerIndex()].money()).to.eql(1500 - amount);
			}, done, done);
		}
		
		function assertCurrentPlayerHasPaidToOwner(gameState, amount, ownerIndex, done) {
			gameState.take(1).subscribe(function (state) {
				expect(state.players()[state.currentPlayerIndex()].money()).to.eql(1500 - amount);
				expect(state.players()[1].money()).to.eql(1500 + amount);
			}, done, done);
		}
		
		function assertPlayerHasBeenRemovedFromTheGame(gameState, playerId, done) {
			gameState.take(1).subscribe(function (state) {
				var isPresent = _.some(state.players(), function (player) {
					return player.id() === playerId;
				});
				expect(isPresent).to.be(false);
			}, done, done);
		}
		
		function assertGameIsOver(gameState, done) {
			gameState.take(1)
				.map(onlyChoices)
				.subscribe(function (choices) {
					expect(choices.length).to.eql(0);
				}, done, done);
		}
	});
}());