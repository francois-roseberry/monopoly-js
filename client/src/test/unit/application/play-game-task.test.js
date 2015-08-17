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
			task = PlayGameTask.start(Board.SQUARES, testPlayers.PLAYERS);
		});
		
		it('at start, sends an event with the roll-dice choice', function (done) {
			task.choices().take(1).subscribe(function (choices) {
				expect(choices).to.eql([Choices.rollDice()]);
			}, done, done);
		});
		
		it('at start, sends an event with the initial game state', function (done) {
			task.gameState().take(1).subscribe(function (state) {
				expect(state.squares).to.eql(Board.SQUARES);
				expect(state.players.length).to.eql(testPlayers.PLAYERS.length);
				_.each(state.players, function (player, index) {
					expect(player.name).to.eql('Joueur ' + (index + 1));
					expect(player.money).to.eql(1500);
					expect(player.position).to.eql(0);
					expect(player.color).to.eql(PlayerColors[index]);
				});
			}, done, done);
		});
		
		it('has a messages observable', function () {
			expect(task.messages()).to.not.be(undefined);
		});
		
		it('stopping the task sends an event', function (done) {
			task.stop();
			
			task.completed().subscribe(_.noop, done, done);
		});
		
		it('when roll-dice is chosen, creates a roll-dice-task', function (done) {
			task.rollDiceTaskCreated().take(1).subscribe(function (task) {
				expect(task).to.not.eql(undefined);
			}, done, done);
			
			task.makeChoice(Choices.rollDice().id);
		});
		
		describe('after dice have finished rolling', function () {
			var newPosition;
			var newChoices;
			
			beforeEach(function (done) {
				Rx.Observable.combineLatest(
					task.gameState().skip(1).take(1),
					task.choices().skip(2).take(1),
					
					function (state, choices) {
						newPosition = state.players[0].position;
						newChoices = choices;
						
						return {};
					})
					.subscribe(_.noop, done, done);
				
				task.makeChoice(Choices.rollDice().id);
			});
			
			it('send a game state event with the new position', function () {
				expect(newPosition).to.not.eql(0);
			});
			
			it('send a choices event with the finish-turn choice', function () {
				expect(newChoices).to.eql([Choices.finishTurn()]);
			});
		});
	});
}());