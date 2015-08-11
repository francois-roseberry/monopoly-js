(function() {
	"use strict";
	
	var Square = require('./square');
	var MonopolyGameWidget = require('./monopoly-game-widget');
	var PlayGameTask = require('./play-game-task');
	
	var testPlayers = require('./test-players');
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A Monopoly game widget', function (domContext) {
		var task;
		
		beforeEach(function () {
			task = PlayGameTask.start(Square.SQUARES, testPlayers.PLAYERS);
			MonopolyGameWidget.render(domContext.rootElement, task);
		});
		
		it('is rendered in the given container', function () {
			domContext.assertOneOf('.monopoly-game');
		});
		
		it('renders a new game button', function () {
			domContext.assertOneOf('button');
			domContext.assertText('button', 'New game');
		});
		
		it('clicking on the new game button stops the task', function (done) {
			domContext.clickOn('button');
			
			task.completed().subscribe(_.noop, done, done);
		});
		
		it('renders the board', function () {
			domContext.assertOneOf('.monopoly-board');
		});
		
		it('renders the players widget', function () {
			domContext.assertOneOf('.monopoly-players');
		});
	});
}());