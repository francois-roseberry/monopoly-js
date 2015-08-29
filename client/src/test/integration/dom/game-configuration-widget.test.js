(function() {
	"use strict";
	
	var GameConfigurationWidget = require('./game-configuration-widget');
	var ConfigureGameTask = require('./configure-game-task');
	
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A game configuration widget', function (domContext) {
		var task;
		
		beforeEach(function () {
			task = ConfigureGameTask.start();
			GameConfigurationWidget.render(domContext.rootElement, task);
		});
		
		it('is rendered in the given container', function () {
			domContext.assertOneOf('.monopoly-game-configuration');
		});
		
		it('displays the title', function () {
			domContext.assertOneOf('h1');
		});
		
		it('displays a control for selecting the computer players', function () {
			domContext.assertOneOf('.computer-players');
		});
		
		it('displays the start game button', function () {
			domContext.assertOneOf('.btn-start-game');
		});
		
		it('clicking the start game button completes the game configuration task', function (done) {
			domContext.clickOn('.btn-start-game');
			
			task.completed().subscribe(_.noop, done, done);
		});
	});
}());