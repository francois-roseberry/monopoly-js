(function() {
	"use strict";
	
	var PlayGameTask = require('./play-game-task');
	var LogGameTask = require('./log-game-task');
	var Board = require('./board');
	var Choices = require('./choices');
	
	var testPlayers = require('./test-players');
	
	describe('The log game task', function () {
		var gameTask;
		var logTask;
		
		beforeEach(function () {
			gameTask = PlayGameTask.start(Board.SQUARES, testPlayers.PLAYERS, { fastDice: true });
			logTask = LogGameTask.start(gameTask);
		});
		
		it('when dice finishes rolling, sends a message', function (done) {
			gameTask.rollDiceTaskCreated().take(1).subscribe(function (task) {
				task.diceRolled().last().subscribe(function () {
					assertLogged(done);
				});
			});
			
			gameTask.makeChoice(Choices.rollDice());
		});
		
		function assertLogged(done) {
			logTask.messages().take(1).subscribe(function (message) {
				expect(message).to.not.be(undefined);
			}, done, done);
		}
	});
}());