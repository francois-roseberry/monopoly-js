(function() {
	"use strict";
	
	var PlayGameTask = require('./play-game-task');
	var Messages = require('./messages');
	var Board = require('./board');
	var TradeOffer = require('./trade-offer');
	var PayTaxChoice = require('./pay-tax-choice');
	var PayRentChoice = require('./pay-rent-choice');
	var MoveChoice = require('./move-choice');
	var BuyPropertyChoice = require('./buy-property-choice');
	var AcceptOfferChoice = require('./accept-offer-choice');
	var RejectOfferChoice = require('./reject-offer-choice');
	var TradeChoice = require('./trade-choice');
	var GoToJailChoice = require('./go-to-jail-choice');
	var GoBankruptChoice = require('./go-bankrupt-choice');
	var FinishTurnChoice = require('./finish-turn-choice');
	
	var testData = require('./test-data');
	
	describe('The log game task', function () {
		var gameTask;
		var logs;
		var firstPlayer;
		var secondPlayer;
		var board;
		
		beforeEach(function () {
			gameTask = PlayGameTask.start(testData.gameConfiguration());
			logs = [];
			gameTask.messages().subscribe(function (log) {
				logs.push(log);
			});
			
			gameTask.gameState().take(1)
				.subscribe(function (state) {
					board = state.board();
					firstPlayer = state.players()[0];
					secondPlayer = state.players()[1];
				});
		});
		
		it('when dice finishes rolling, sends a message', function (done) {
			gameTask.rollDiceTaskCreated().take(1).subscribe(function (task) {
				task.diceRolled().last().subscribe(function () {
					expect(logs.length).to.eql(1);
					
					var possibleLogs = [
						Messages.logDiceRoll(firstPlayer, 2, 3).id(),
						Messages.logDoubleDiceRoll(firstPlayer, 5).id()
					];
					
					expect(possibleLogs).to.contain(logs[0].id());
				}, done, done);
			});
			
			gameTask.handleChoicesTask().makeChoice(MoveChoice.newChoice());
		});
		
		it('when player buys property, sends a message', function () {
			var choice = BuyPropertyChoice.newChoice(board.properties().readingRailroad);
			gameTask.handleChoicesTask().makeChoice(choice);
			
			var message = Messages.logPropertyBought(firstPlayer, board.properties().readingRailroad);
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
			gameTask.messages().skip(1).take(1).subscribe(function (log) {
				expect(log.equals(Messages.logSalaryReceived(firstPlayer))).to.be(true);
			}, done, done);
			
			gameTask.handleChoicesTask().makeChoice(MoveChoice.newChoice());
		});
		
		it('when player gets jailed, sends a message', function () {
			var choice = GoToJailChoice.newChoice();
			gameTask.handleChoicesTask().makeChoice(choice);
			
			var message = Messages.logGoneToJail(firstPlayer);
			expect(logs.length).to.eql(1);
			expect(logs[0].equals(message)).to.be(true);
		});
		
		describe('when player makes an offer', function () {
			var offer;
			
			beforeEach(function () {
				offer = TradeOffer.newOffer([
					{
						player: testData.players()[0],
						properties: [],
						money: 1
					},
					{
						player: testData.players()[1],
						properties: [],
						money: 2
					}
				]);
				
				gameTask.handleChoicesTask().makeChoice(TradeChoice.newChoice(testData.players()[1]), offer);
			});
			
			it('sends a message describing the offer', function () {
				var message = Messages.logOfferMade(
					testData.players()[0], testData.players()[1], offer);
					
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
			
			it('if it is accepted, sends a message', function () {
				var choice = AcceptOfferChoice.newChoice(offer);
				gameTask.handleChoicesTask().makeChoice(choice);
				
				var message = Messages.logOfferAccepted();
				expect(logs.length).to.eql(2);
				expect(logs[1].equals(message)).to.be(true);
			});
		});
		
		it('when a player goes bankrupt, sends a message', function () {
			var choice = GoBankruptChoice.newChoice();
			gameTask.handleChoicesTask().makeChoice(choice);
			
			var message = Messages.logGoneBankrupt(firstPlayer);
			expect(logs.length).to.eql(1);
			expect(logs[0].equals(message)).to.be(true);
		});
		
		it('when game finishes, sends a message', function () {
			finishGame();
			
			var message = Messages.logGameWon(firstPlayer);
			expect(logs.length).to.eql(3);
			expect(logs[2].equals(message)).to.be(true);
		});
		
		function finishGame() {
			var choice = FinishTurnChoice.newChoice();
			gameTask.handleChoicesTask().makeChoice(choice);
			
			choice = GoBankruptChoice.newChoice();
			gameTask.handleChoicesTask().makeChoice(choice);
			gameTask.handleChoicesTask().makeChoice(choice);
		}
		
		function gameTaskWithCheatedDice(dieValue) {
			return PlayGameTask.start({ board: Board.standard(), players: testData.playersConfiguration(), options: { 
				fastDice: true,
				dieFunction: function () {
					return dieValue;
				}
			}});
		}
	});
}());