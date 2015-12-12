(function() {
	"use strict";
	
	var MonopolyGameWidget = require('./monopoly-game-widget');
	var PlayGameTask = require('./play-game-task');
	var MoveChoice = require('./move-choice');
	var TradeChoice = require('./trade-choice');
	
	var testData = require('./test-data');
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A Monopoly game widget', function (domContext) {
		var task;
		var currentState;
		
		beforeEach(function () {
			task = PlayGameTask.start(testData.gameConfiguration());
			MonopolyGameWidget.render(domContext.rootElement, task);
			
			task.gameState().subscribe(function (state) {
				currentState = state;
			});
		});
		
		it('is rendered in the given container', function () {
			domContext.assertOneOf('.monopoly-game');
		});
		
		it('renders a new game button', function () {
			domContext.assertOneOf('#new-game-button');
		});
		
		it('clicking on the new game button stops the task', function (done) {
			domContext.clickOn('#new-game-button');
			
			task.completed().subscribe(_.noop, done, done);
		});
		
		it('renders the board', function () {
			domContext.assertOneOf('.monopoly-board');
		});
		
		it('renders the game choices widget', function () {
			domContext.assertOneOf('.monopoly-game-choices');
		});
		
		it('renders the log game widget', function () {
			domContext.assertOneOf('.game-log-console');
		});
		
		it('renders the players widget', function () {
			domContext.assertOneOf('.monopoly-players');
		});
		
		it('renders the dice-widget when a dice task is created', function () {
			task.handleChoicesTask().makeChoice(MoveChoice.newChoice());
			
			domContext.assertOneOf('.dice-container');
		});
			
		it('renders the trade widget when a trade task is created', function () {
			task.handleChoicesTask().makeChoice(TradeChoice.newChoice(currentState.players()[1]));
			
			domContext.assertOneOf('.monopoly-trade-panel');
		});
	});
}());