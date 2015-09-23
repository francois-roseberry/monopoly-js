(function() {
	"use strict";
	
	var PlayGameTask = require('./play-game-task');
	var LogGameTask = require('./log-game-task');
	var Choices = require('./choices');
	var Messages = require('./messages');
	var Railroad = require('./railroad');
	
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
						Messages.logDiceRoll('Player', 2, 3).id(),
						Messages.logDoubleDiceRoll('Player', 5).id()
					], done);
				});
			});
			
			gameTask.handleChoicesTask().makeChoice(Choices.rollDice());
		});
		
		it('when player buys property, sends a message', function (done) {
			var message = Messages.logPropertyBought('Player', 'Property').id();
			assertLogged([message], done);
			
			var choice = Choices.buyProperty(Railroad.reading());
			gameTask.handleChoicesTask().makeChoice(choice);
		});
		
		it('when player pays rent, sends a message', function (done) {
			var rent = 20;
			var fromPlayerName = testData.players()[0].name();
			var toPlayerName = testData.players()[1].name();
			var message = Messages.logRentPaid(rent, fromPlayerName, toPlayerName).id();
			
			assertLogged([message], done);
			
			var choice = Choices.payRent(rent, testData.players()[1].id(), toPlayerName);
			gameTask.handleChoicesTask().makeChoice(choice);
		});
		
		function assertLogged(logs, done) {
			logTask.messages().take(1).subscribe(function (log) {
				expect(logs).to.contain(log.id());
			}, done, done);
		}
	});
}());