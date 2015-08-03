(function() {
	"use strict";
	
	var GameConfigurationWidget = require('./game-configuration-widget');
	var MonopolyGameTask = require('./monopoly-game-task');
	
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A game configuration widget', function (domContext) {
		var task;
		
		beforeEach(function () {
			task = MonopolyGameTask.start();
			GameConfigurationWidget.render(domContext.rootElement, task);
		});
		
		it('is rendered in the given container', function () {
			domContext.assertOneOf('.monopoly-game-configuration');
		});
		
		it('displays the title', function () {
			domContext.assertText('h1', 'Monopoly game configuration');
		});
		
		it('displays a control for selecting the computer players', function () {
			domContext.assertOneOf('.computer-players');
		});
		
		it('displays the start game button', function () {
			domContext.assertOneOf('button');
			domContext.assertText('button', 'Start game');
		});
		
		it('clicking the start game button starts a game', function () {
			domContext.clickOn('button');
			
			task.statusChanged().subscribe(function (status) {
				expect(status.statusName).to.eql('playing');
			});
		});
	});
}());