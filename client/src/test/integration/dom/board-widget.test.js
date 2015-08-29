(function() {
	"use strict";
	
	var Board = require('./board');
	var BoardWidget = require('./board-widget');
	var PlayGameTask = require('./play-game-task');
	
	var testPlayers = require('./test-players');
	var describeInDom = require('./dom-fixture').describeInDom;
		
	describeInDom('A Board Widget', function (domContext) {
		var task;
		beforeEach(function () {
			task = PlayGameTask.start(Board.squares(), testPlayers.PLAYERS);
			BoardWidget.render(domContext.rootElement, task.gameState());
		});
		
		it('is rendered in the correct div', function () {
			domContext.assertOneOf('.monopoly-board');
		});
		
		it('renders 4 rows', function () {
			domContext.assertElementCount('.monopoly-row', 4);
		});
		
		it('renders all the squares', function () {
			domContext.assertElementCount('.monopoly-row > .monopoly-square', Board.squares().length);
		});
		
		it('renders a token for each player', function () {
			domContext.assertElementCount('.player-token', testPlayers.PLAYERS.length);
		});
	});
}());