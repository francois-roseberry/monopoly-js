(function() {
	"use strict";
	
	var PlayersWidget = require('./players-widget');
	var PlayGameTask = require('./play-game-task');
	
	var testData = require('./test-data');
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A Players widget', function (domContext) {
		beforeEach(function () {
			var task = PlayGameTask.start(testData.gameConfiguration());
			PlayersWidget.render(domContext.rootElement, task.gameState());
		});
		
		it('is rendered in the given container', function () {
			domContext.assertOneOf('.monopoly-players');
		});
		
		it('renders a pane for each player', function () {
			domContext.assertElementCount('.player-panel', testData.playersConfiguration().length);
		});
		
		it('renders the player tokens', function () {
			domContext.assertElementCount('.player-panel > .player-panel-token',
				testData.playersConfiguration().length);
		});
		
		it('renders the player names', function () {
			domContext.assertElementCount('.player-panel > .player-name', testData.playersConfiguration().length);
		});
		
		it('renders the player amounts', function () {
			domContext.assertElementCount('.player-panel > .player-money', testData.playersConfiguration().length);
		});
	});
}());