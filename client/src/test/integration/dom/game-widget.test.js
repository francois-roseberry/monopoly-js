(function() {
	"use strict";
	
	var GameWidget = require('./game-widget');
	var GameTask = require('./game-task');
	
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A Game widget', function (domContext) {
		var task;
		
		beforeEach(function () {
			task = GameTask.start();
			GameWidget.render(domContext.rootElement, task);
		});
		
		it('renders the game configuration widget in the given container ' +
			'when its game task send the configuring status', function () {
				domContext.assertOneOf('.monopoly-game-configuration');
			});
			
		it('renders the monopoly game widget in the given container ' +
			'when its game task send the playing status', function () {
				task.startGame();
				
				domContext.assertOneOf('.monopoly-game');
				domContext.assertNothingOf('.monopoly-game-configuration');
			});
	});
}());