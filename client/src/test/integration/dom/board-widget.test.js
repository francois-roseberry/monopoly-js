(function() {
	"use strict";
	
	var BoardWidget = require('./board-widget');
	var PlayGameTask = require('./play-game-task');
	
	var testData = require('./test-data');
	var describeInDom = require('./dom-fixture').describeInDom;
		
	describeInDom('A Board Widget', function (domContext) {
		var task;
		var currentState;
		
		beforeEach(function () {
			task = PlayGameTask.start(testData.gameConfiguration());
			BoardWidget.render(domContext.rootElement, task.gameState());
			
			task.gameState().subscribe(function (state) {
				currentState = state;
			});
		});
		
		it('is rendered in the correct div', function () {
			domContext.assertOneOf('.monopoly-board');
		});
		
		it('renders 4 rows', function () {
			domContext.assertElementCount('.monopoly-row', 4);
		});
		
		it('renders all the squares', function () {
			assertAllSquares();
		});
		
		it('renders a token for each player', function () {			
			assertOneTokenForEachPlayer();
		});
		
		function assertAllSquares() {
			domContext.assertElementCount('.monopoly-square', currentState.board().squares().length);
			
			_.each(currentState.board().squares(), function (_, index) {
				domContext.assertOneOf('.monopoly-square[data-ui=' + index + ']');
			});
		}
		
		function assertOneTokenForEachPlayer() {
			domContext.assertElementCount('.player-token', currentState.players().length);
			
			_.each(currentState.players(), function (player) {
				domContext.assertOneOf('.player-token[data-ui=' + player.id() + ']');
				domContext.assertOneOf(
					'.monopoly-square[data-ui=' + 0 + '] .player-token[data-ui=' + player.id() + ']');
			});
		}
	});
}());