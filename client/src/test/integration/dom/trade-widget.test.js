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
			var board = Board.standard();
			currentPlayer = testData.players()[0].buyProperty(board.properties().readingRailroad);
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
			domContext.assertOneOf('#trade-title');
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
		
		it('entering an amount in the money spinner changes the offer', function () {
			var selector = '.monopoly-trade-player-panel[data-ui=' + currentPlayer.id() +
				'] .monopoly-trade-player-money-spinner';
				
			$(selector).spinner('value', 1);
			
			expect(currentOffer.moneyFor(0)).to.eql(1);
		});
		
		it('renders the money total for both players', function () {
			domContext.assertElementCount('.monopoly-trade-player-money-total', 2);
		});
		
		it('renders a button to make the offer', function () {
			domContext.assertOneOf('[data-ui=make-offer-btn]');
		});
		
		it('renders a button to cancel the trade', function () {
			domContext.assertOneOf('[data-ui=cancel-trade-btn]');
		});
		
		it('when offer is invalid, the make offer button is disabled', function () {
			domContext.assertDisabled('[data-ui=make-offer-btn]');
		});
		
		describe('when offer is valid', function () {
			beforeEach(function () {
				selectValidOffer();
			});
			
			it('the make offer button is enabled', function () {
				domContext.assertEnabled('[data-ui=make-offer-btn]');
			});
			
			it('clicking on the make offer button removes the widget', function () {
				domContext.d3.clickOn('[data-ui=make-offer-btn]');
			
				domContext.assertNothingOf('.monopoly-trade-panel');
			});
		});
		
		it('clicking on the cancel trade button removes the widget', function () {
			domContext.d3.clickOn('[data-ui=cancel-trade-btn]');
			
			domContext.assertNothingOf('.monopoly-trade-panel');
		});
		
		function selectValidOffer() {
			var currentPlayerSelector = '.monopoly-trade-player-panel[data-ui=' + currentPlayer.id() +
				'] .monopoly-trade-player-money-spinner';
				
			$(currentPlayerSelector).spinner('value', 1);
			
			var otherPlayerSelector = '.monopoly-trade-player-panel[data-ui=' + otherPlayer.id() +
				'] .monopoly-trade-player-money-spinner';
				
			$(otherPlayerSelector).spinner('value', 1);
		}
	});
}());