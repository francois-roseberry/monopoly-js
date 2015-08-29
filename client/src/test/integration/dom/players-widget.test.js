(function() {
	"use strict";
	
	var Board = require('./board');
	var PlayersWidget = require('./players-widget');
	var PlayGameTask = require('./play-game-task');
	
	var testPlayers = require('./test-players');
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A Players widget', function (domContext) {
		beforeEach(function () {
			var task = PlayGameTask.start(Board.squares(), testPlayers.PLAYERS);
			PlayersWidget.render(domContext.rootElement, task.gameState());
		});
		
		it('is rendered in the given container', function () {
			domContext.assertOneOf('.monopoly-players');
		});
		
		it('renders a pane for each player', function () {
			domContext.assertElementCount('.player-panel', testPlayers.PLAYERS.length);
		});
		
		it('renders the player tokens', function () {
			domContext.assertElementCount('.player-panel > .player-panel-token', testPlayers.PLAYERS.length);
		});
		
		it('renders the player names', function () {
			domContext.assertElementCount('.player-panel > .player-name', testPlayers.PLAYERS.length);
		});
		
		it('renders the player amounts', function () {
			domContext.assertElementCount('.player-panel > .player-money', testPlayers.PLAYERS.length);
		});
	});
}());