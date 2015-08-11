(function() {
	"use strict";
	
	var Board = require('./board');
	var BoardWidget = require('./board-widget');
	var PlayGameTask = require('./play-game-task');
	
	var testPlayers = require('./test-players');
	var describeInDom = require('./dom-fixture').describeInDom;
		
	describeInDom('A Board Widget', function (domContext) {
		beforeEach(function () {
			var task = PlayGameTask.start(Board.SQUARES, testPlayers.PLAYERS);
			BoardWidget.render(domContext.rootElement, task.gameState());
		});
		
		it('is rendered in the correct div', function () {
			domContext.assertOneOf('.monopoly-board');
		});
		
		it('renders 4 rows', function () {
			domContext.assertElementCount('.monopoly-row', 4);
		});
		
		it('renders all the squares', function () {
			domContext.assertElementCount('.monopoly-row > .monopoly-square', Board.SQUARES.length);
		});
		
		it('renders a token for each player', function () {
			domContext.assertElementCount('.player-token', testPlayers.PLAYERS.length);
		});
	});
}());