(function() {
	"use strict";
	
	var PlayGameTask = require('./play-game-task');
	var LogGameTask = require('./log-game-task');
	var Choices = require('./choices');
	var Messages = require('./messages');
	
	var testData = require('./test-data');
	
	describe('The log game task', function () {
		var gameTask;
		var logTask;
		
		beforeEach(function () {
			gameTask = PlayGameTask.start(testData.gameConfiguration());
			logTask = LogGameTask.start(gameTask);
		});
		
		it('when dice finishes rolling, sends a message', function (done) {
			gameTask.rollDiceTaskCreated().take(1).subscribe(function (task) {
				task.diceRolled().last().subscribe(function () {
					assertLogged([
						Messages.logDiceRoll().id(),
						Messages.logDoubleDiceRoll().id()
					], done);
				});
			});
			
			gameTask.handleChoicesTask().makeChoice(Choices.rollDice());
		});
		
		it('when player buys property, sends a message', function (done) {
			assertLogged([Messages.logPropertyBought().id()], done);
			
			gameTask.handleChoicesTask().makeChoice(Choices.buyProperty('rr-reading', '', 20));
		});
		
		function assertLogged(logs, done) {
			logTask.messages().take(1).subscribe(function (log) {
				expect(logs).to.contain(log.id());
			}, done, done);
		}
	});
}());