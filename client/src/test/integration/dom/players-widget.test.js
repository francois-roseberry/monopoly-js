(function() {
	"use strict";
	
	var PlayersWidget = require('./players-widget');
	var PlayGameTask = require('./play-game-task');
	var GoBankruptChoice = require('./go-bankrupt-choice');
	var BuyPropertyChoice = require('./buy-property-choice');
	
	var testData = require('./test-data');
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A Players widget', function (domContext) {
		var currentState;
		var task;
		
		beforeEach(function () {
			task = PlayGameTask.start(testData.gameConfiguration());
			PlayersWidget.render(domContext.rootElement, task.gameState());
			
			task.gameState().subscribe(function (state) {
				currentState = state;
			});
		});
		
		it('is rendered in the given container', function () {
			domContext.assertOneOf('.monopoly-players');
		});
		
		it('renders a panel for each player', function () {
			assertPlayerPanels();
			eliminateFirstPlayer();
			assertPlayerPanels();
			eliminateFirstPlayer();
			assertPlayerPanels();
		});
		
		it('renders the player tokens', function () {
			assertPlayerTokens();
			eliminateFirstPlayer();
			assertPlayerTokens();
		});
		
		it('renders the player names', function () {
			assertPlayerNames();
			eliminateFirstPlayer();
			assertPlayerNames();
		});
		
		it('renders the player amounts', function () {
			assertPlayerAmounts();
			buyPropertyWithFirstPlayer();
			assertPlayerAmounts();
			eliminateFirstPlayer();
			assertPlayerAmounts();
		});
		
		it('renders the player properties', function () {
			assertPlayerProperties();
			buyPropertyWithFirstPlayer();
			assertPlayerProperties();
			eliminateFirstPlayer();
			assertPlayerProperties();
		});
		
		function assertPlayerPanels() {
			domContext.assertElementCount('.player-panel', currentState.players().length);
			
			_.each(currentState.players(), function (player) {
				domContext.assertOneOf('.player-panel[data-ui=' + player.id() + ']');
			});
		}
		
		function assertPlayerTokens() {
			domContext.assertElementCount('.player-panel-token', currentState.players().length);
			
			_.each(currentState.players(), function (player) {
				domContext.assertOneOf('.player-panel[data-ui=' + player.id() + '] .player-panel-token');
			});
		}
		
		function assertPlayerNames() {
			domContext.assertElementCount('.player-name', currentState.players().length);
			
			_.each(currentState.players(), function (player) {
				domContext.assertText(
					'.player-panel[data-ui=' + player.id() + '] .player-name', player.name());
			});
		}
		
		function assertPlayerAmounts() {
			domContext.assertElementCount('.player-money', currentState.players().length);
			
			_.each(currentState.players(), function (player) {
				domContext.assertSelectionContainsAttributeValues(
					'.player-panel[data-ui=' + player.id() + '] .player-money', 'data-ui', [player.money().toString()]);
			});
		}
		
		function assertPlayerProperties() {
			domContext.assertElementCount('.player-properties', currentState.players().length);
			
			_.each(currentState.players(), function (player) {
				domContext.assertOneOf('.player-panel[data-ui=' + player.id() + '] .player-properties');
				
				_.each(player.properties(), function (property) {
					domContext.assertOneOf(
						'.player-panel[data-ui=' + player.id() + '] .player-property[data-ui=' + property.id() + ']');
				});
			});
		}
		
		function eliminateFirstPlayer() {
			task.handleChoicesTask().makeChoice(GoBankruptChoice.newChoice());
		}
		
		function buyPropertyWithFirstPlayer() {
			var choice = BuyPropertyChoice.newChoice(currentState.board().properties().readingRailroad);
			task.handleChoicesTask().makeChoice(choice);
		}
	});
}());