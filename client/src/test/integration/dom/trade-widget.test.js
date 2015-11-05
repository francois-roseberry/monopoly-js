(function() {
	"use strict";
	
	var TradeTask = require('./trade-task');
	var TradeWidget = require('./trade-widget');
	var Board = require('./board');
	
	var testData = require('./test-data');
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A Trade widget', function (domContext) {
		var currentPlayer;
		var otherPlayer;
		var currentOffer;
		
		beforeEach(function () {
			currentPlayer = testData.players()[0].buyProperty(Board.properties().readingRailroad);
			otherPlayer = testData.players()[1];
			var task = TradeTask.start(currentPlayer, otherPlayer);
			TradeWidget.render(domContext.rootElement, task);
			
			task.offer().subscribe(function(offer) {
				currentOffer = offer;
			});
		});
		
		it('is rendered in the given div', function () {
			domContext.assertOneOf('.monopoly-trade-panel');
		});
		
		it('renders the title', function () {
			domContext.assertOneOf('.monopoly-trade-title');
		});
		
		it('renders a panel for both trade players', function () {
			domContext.assertElementCount('.monopoly-trade-player-panel', 2);
		});
		
		it('renders the name of both trade players', function () {
			domContext.assertElementCount('.monopoly-trade-player-name', 2);
		});
		
		it('renders a property list for both players', function () {
			domContext.assertElementCount('.monopoly-trade-player-properties', 2);
		});
		
		it('renders each property in the list', function () {
			domContext.assertElementCount(
				'.monopoly-trade-player-panel[data-ui=' + currentPlayer.id() + '] .monopoly-trade-player-property',
				currentPlayer.properties().length);
				
			domContext.assertElementCount(
				'.monopoly-trade-player-panel[data-ui=' + otherPlayer.id() + '] .monopoly-trade-player-property',
				otherPlayer.properties().length);
		});
		
		it('clicking on a property selects it', function () {
			var selector = '.monopoly-trade-player-panel[data-ui=' + currentPlayer.id() +
				'] .monopoly-trade-player-property:first-child';
			
			domContext.assertAbsentCssClass(selector, 'monopoly-trade-player-property-selected');
			
			domContext.clickOn(selector);
			
			domContext.assertCssClass(selector, 'monopoly-trade-player-property-selected');
			
			domContext.clickOn(selector);
			
			domContext.assertAbsentCssClass(selector, 'monopoly-trade-player-property-selected');
		});
		
		it('renders a money spinner for both players', function () {
			domContext.assertElementCount('.monopoly-trade-player-money-spinner', 2);
		});
		
		it.only('entering an amount in the money spinner changes the offer', function () {
			var selector = '.monopoly-trade-player-panel[data-ui=' + currentPlayer.id() +
				'] .monopoly-trade-player-money-spinner';
				
			$(selector).spinner('value', 1);
			
			expect(currentOffer[0].money).to.eql(1);
		});
		
		it('renders the money total for both players', function () {
			domContext.assertElementCount('.monopoly-trade-player-money-total', 2);
		});
		
		it('renders a button to make the offer', function () {
			domContext.assertOneOf('.monopoly-trade-make-offer-btn');
		});
	});
}());