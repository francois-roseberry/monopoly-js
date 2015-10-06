(function() {
	"use strict";
	
	var MonopolyGameWidget = require('./monopoly-game-widget');
	var PlayGameTask = require('./play-game-task');
	var RollDiceChoice = require('./roll-dice-choice');
	
	var testData = require('./test-data');
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A Monopoly game widget', function (domContext) {
		var task;
		
		beforeEach(function () {
			task = PlayGameTask.start(testData.gameConfiguration());
			MonopolyGameWidget.render(domContext.rootElement, task);
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
		
		it('renders the dice-widget when the task requires it', function () {
			task.handleChoicesTask().makeChoice(RollDiceChoice.newChoice());
			
			domContext.assertOneOf('.dice-container');
		});
	});
}());