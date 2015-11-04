(function() {
	"use strict";
	
	var TradeTask = require('./trade-task');
	var Board = require('./board');
	
	var testData = require('./test-data');
	
	describe('A TradeTask', function () {
		var task;
		var currentOffer;
		
		beforeEach(function () {
			task = TradeTask.start(testData.players()[0], testData.players()[1]);
			
			task.offer().subscribe(function (offer) {
				currentOffer = offer;
			});
		});
		
		it('has an empty initial offer', function () {
			expect(currentOffer.currentPlayer.money).to.eql(0);
			expect(currentOffer.otherPlayer.money).to.eql(0);
			expect(currentOffer.properties).to.eql([]);
		});
		
		it('can toggle selection state of a property', function () {
			task.togglePropertySelection(Board.properties().readingRailroad.id());
			
			expect(currentOffer.properties).to.eql([Board.properties().readingRailroad.id()]);
			
			task.togglePropertySelection(Board.properties().readingRailroad.id());
			
			expect(currentOffer.properties).to.eql([]);
		});
		
		it('can set the money offered by current player', function () {
			task.setMoneyOfferedByCurrentPlayer(1);
			
			expect(currentOffer.currentPlayer.money).to.eql(1);
			expect(currentOffer.otherPlayer.money).to.eql(0);
		});
		
		it('can set the money offered by other player', function () {
			task.setMoneyOfferedByOtherPlayer(1);
			
			expect(currentOffer.currentPlayer.money).to.eql(0);
			expect(currentOffer.otherPlayer.money).to.eql(1);
		});
	});
}());