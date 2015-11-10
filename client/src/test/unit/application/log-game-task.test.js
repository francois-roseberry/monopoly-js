(function() {
	"use strict";
	
	var PlayGameTask = require('./play-game-task');
	var LogGameTask = require('./log-game-task');
	var Messages = require('./messages');
	var Board = require('./board');
	var TradeOffer = require('./trade-offer');
	var PayTaxChoice = require('./pay-tax-choice');
	var PayRentChoice = require('./pay-rent-choice');
	var MoveChoice = require('./move-choice');
	var BuyPropertyChoice = require('./buy-property-choice');
	var RejectOfferChoice = require('./reject-offer-choice');
	var TradeChoice = require('./trade-choice');
	
	var testData = require('./test-data');
	
	describe('The log game task', function () {
		var gameTask;
		var logTask;
		var logs;
		var firstPlayer;
		var secondPlayer;
		
		beforeEach(function () {
			gameTask = PlayGameTask.start(testData.gameConfiguration());
			logTask = LogGameTask.start(gameTask);
			logs = [];
			logTask.messages().subscribe(function (log) {
				logs.push(log);
			});
			
			gameTask.gameState().take(1)
				.subscribe(function (state) {
					firstPlayer = state.players()[0];
					secondPlayer = state.players()[1];
				});
		});
		
		it('when dice finishes rolling, sends a message', function (done) {
			gameTask.rollDiceTaskCreated().take(1).subscribe(function (task) {
				task.diceRolled().last().subscribe(function () {
					assertLogged([
						Messages.logDiceRoll(firstPlayer, 2, 3).id(),
						Messages.logDoubleDiceRoll(firstPlayer, 5).id()
					], done);
				});
			});
			
			gameTask.handleChoicesTask().makeChoice(MoveChoice.newChoice());
		});
		
		it('when player buys property, sends a message', function () {
			var choice = BuyPropertyChoice.newChoice(Board.properties().readingRailroad);
			gameTask.handleChoicesTask().makeChoice(choice);
			
			var message = Messages.logPropertyBought(firstPlayer, Board.properties().readingRailroad);
			expect(logs.length).to.eql(1);
			expect(logs[0].equals(message)).to.be(true);
		});
		
		it('when player pays rent, sends a message', function () {
			var rent = 20;
			
			var choice = PayRentChoice.newChoice(rent, secondPlayer);
			gameTask.handleChoicesTask().makeChoice(choice);
			
			var message = Messages.logRentPaid(rent, firstPlayer, secondPlayer);
			expect(logs.length).to.eql(1);
			expect(logs[0].equals(message)).to.be(true);
		});
		
		it('when player pays tax, sends a message', function () {
			var tax = 75;
			
			var choice = PayTaxChoice.newChoice(tax);
			gameTask.handleChoicesTask().makeChoice(choice);
			
			var message = Messages.logTaxPaid(tax, firstPlayer);
			expect(logs.length).to.eql(1);
			expect(logs[0].equals(message)).to.be(true);
		});
		
		it('when player wraps around the board, sends a message', function (done) {
			gameTask = gameTaskWithCheatedDice(21);
			logTask = LogGameTask.start(gameTask);
			logTask.messages().skip(1).take(1).subscribe(function (log) {
				expect(log.equals(Messages.logSalaryReceived(firstPlayer))).to.be(true);
			}, done, done);
			
			gameTask.handleChoicesTask().makeChoice(MoveChoice.newChoice());
		});
		
		describe('when player makes an offer', function () {
			var offer;
			
			beforeEach(function () {
				offer = TradeOffer.newOffer([
					{
						playerId: testData.players()[0].id(),
						properties: [],
						money: 1
					},
					{
						playerId: testData.players()[1].id(),
						properties: [],
						money: 1
					}
				]);
				
				gameTask.handleChoicesTask().makeChoice(TradeChoice.newChoice(testData.players()[1]), offer);
			});
			
			it('sends a message describing the offer', function () {
				var message = Messages.logOfferMade(
					testData.players()[0].name(), testData.players()[1].name(), offer);
					
				expect(logs.length).to.eql(1);
				expect(logs[0].equals(message)).to.be(true);
			});
			
			it('if it is rejected, sends a message', function () {
				var choice = RejectOfferChoice.newChoice(testData.players()[0].id());
				gameTask.handleChoicesTask().makeChoice(choice);
				
				var message = Messages.logOfferRejected();
				expect(logs.length).to.eql(2);
				expect(logs[1].equals(message)).to.be(true);
			});
		});
		
		function assertLogged(logs, done) {
			logTask.messages().take(1).subscribe(function (log) {
				expect(logs).to.contain(log.id());
			}, done, done);
		}
		
		function gameTaskWithCheatedDice(dieValue) {
			return PlayGameTask.start({ squares: Board.squares(), players: testData.playersConfiguration(), options: { 
				fastDice: true,
				dieFunction: function () {
					return dieValue;
				}
			}});
		}
	});
}());