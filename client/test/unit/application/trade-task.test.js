(function() {
	"use strict";
	
	var TradeTask = require('./trade-task');
	var Board = require('./board');
	
	var testData = require('./test-data');
	
	describe('A TradeTask', function () {
		var task;
		var board;
		var currentOffer;
		var completed = false;
		
		beforeEach(function () {
			board = Board.standard();
			task = TradeTask.start(
				testData.players()[0].buyProperty(board.properties().readingRailroad),
				testData.players()[1].buyProperty(board.properties().readingRailroad));
			
			task.offer().subscribe(function (offer) {
				currentOffer = offer;
			}, _.noop, function () {
				completed = true;
			});
		});
		
		it('has an empty initial offer', function () {
			expect(currentOffer.isEmpty()).to.be(true);
		});
		
		it('can toggle a property in the offer by current player', function () {
			task.togglePropertyOfferedByPlayer(board.properties().readingRailroad.id(), 0);
			
			expect(currentOffer.propertiesFor(0).length).to.eql(1);
			expect(currentOffer.propertiesFor(0)[0].equals(board.properties().readingRailroad)).to.be(true);
			
			task.togglePropertyOfferedByPlayer(board.properties().readingRailroad.id(), 0);
			
			expect(currentOffer.propertiesFor(0)).to.eql([]);
		});
		
		it('can toggle a property in the offer by other player', function () {
			task.togglePropertyOfferedByPlayer(board.properties().readingRailroad.id(), 1);
			
			expect(currentOffer.propertiesFor(1).length).to.eql(1);
			expect(currentOffer.propertiesFor(1)[0].equals(board.properties().readingRailroad)).to.be(true);
			
			task.togglePropertyOfferedByPlayer(board.properties().readingRailroad.id(), 1);
			
			expect(currentOffer.propertiesFor(1)).to.eql([]);
		});
		
		it('can set the money offered by current player', function () {
			task.setMoneyOfferedByPlayer(1, 0);
			
			expect(currentOffer.moneyFor(0)).to.eql(1);
			expect(currentOffer.moneyFor(1)).to.eql(0);
		});
		
		it('can set the money offered by other player', function () {
			task.setMoneyOfferedByPlayer(1, 1);
			
			expect(currentOffer.moneyFor(0)).to.eql(0);
			expect(currentOffer.moneyFor(1)).to.eql(1);
		});
		
		describe('when making offer', function () {
			it('task is completed', function () {
				task.makeOffer();
				
				expect(completed).to.be(true);
			});
		});
		
		describe('when canceling the trade', function () {
			beforeEach(function () {
				task.cancel();
			});
			
			it('offer becomes empty', function () {
				expect(currentOffer.isEmpty()).to.be(true);
			});
			
			it('task is completed', function () {
				expect(completed).to.be(true);
			});
		});
	});
}());