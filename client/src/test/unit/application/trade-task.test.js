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
			expect(currentOffer[0].money).to.eql(0);
			expect(currentOffer[1].money).to.eql(0);
			expect(currentOffer[0].properties).to.eql([]);
			expect(currentOffer[1].properties).to.eql([]);
		});
		
		it('can toggle a property in the offer by current player', function () {
			task.togglePropertyOfferForPlayer(Board.properties().readingRailroad.id(), 0);
			
			expect(currentOffer[0].properties).to.eql([Board.properties().readingRailroad.id()]);
			
			task.togglePropertyOfferForPlayer(Board.properties().readingRailroad.id(), 0);
			
			expect(currentOffer[0].properties).to.eql([]);
		});
		
		it('can toggle a property in the offer by other player', function () {
			task.togglePropertyOfferForPlayer(Board.properties().readingRailroad.id(), 1);
			
			expect(currentOffer[1].properties).to.eql([Board.properties().readingRailroad.id()]);
			
			task.togglePropertyOfferForPlayer(Board.properties().readingRailroad.id(), 1);
			
			expect(currentOffer[1].properties).to.eql([]);
		});
		
		it('can set the money offered by current player', function () {
			task.setMoneyOfferedByCurrentPlayer(1);
			
			expect(currentOffer[0].money).to.eql(1);
			expect(currentOffer[1].money).to.eql(0);
		});
		
		it('can set the money offered by other player', function () {
			task.setMoneyOfferedByOtherPlayer(1);
			
			expect(currentOffer[0].money).to.eql(0);
			expect(currentOffer[1].money).to.eql(1);
		});
	});
}());