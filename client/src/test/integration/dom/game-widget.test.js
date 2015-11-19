(function() {
	"use strict";
	
	var GameWidget = require('./game-widget');
	var GameTask = require('./game-task');
	
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A Game widget', function (domContext) {
		var currentStatus;
		var task;
		
		beforeEach(function () {
			task = GameTask.start();
			GameWidget.render(domContext.rootElement, task);
			
			task.status().subscribe(function (status) {
				currentStatus = status;
			});
		});
			
		it('renders the right game component in the given container', function () {
			assertGameConfigurationPresent();
			assertGameAbsent();
			
			startGame();
			
			assertGamePresent();
			assertGameConfigurationAbsent();
			
			newGame();
			
			assertGameConfigurationPresent();
			assertGameAbsent();
		});
			
		function startGame() {
			currentStatus.match({
				'configuring': function (task) {
					task.startGame();
				}
			});
		}
		
		function newGame() {
			currentStatus.match({
				'playing': function (task) {
					task.stop();
				}
			});
		}
		
		function assertGamePresent() {
			domContext.assertOneOf('.monopoly-game');
		}
		
		function assertGameAbsent() {
			domContext.assertNothingOf('.monopoly-game');
		}
		
		function assertGameConfigurationPresent() {
			domContext.assertOneOf('.monopoly-game-configuration');
		}
		
		function assertGameConfigurationAbsent() {
			domContext.assertNothingOf('.monopoly-game-configuration');
		}
	});
}());