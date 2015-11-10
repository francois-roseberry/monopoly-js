(function() {
	"use strict";
	
	var GameChoicesWidget = require('./game-choices-widget');
	var PlayGameTask = require('./play-game-task');
	
	var testData = require('./test-data');
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A game choices widget', function (domContext) {
		var currentChoices;
		var choiceMade;
		var task;
		
		beforeEach(function () {
			task = PlayGameTask.start(testData.gameConfiguration()).handleChoicesTask();
			GameChoicesWidget.render(domContext.rootElement, task);
			
			task.choices().subscribe(function (choices) {
				currentChoices = choices;
			});
			
			task.choiceMade().subscribe(function (action) {
				choiceMade = action.choice;
			});
		});
		
		it('is rendered in the given container', function () {
			domContext.assertOneOf('.monopoly-game-choices');
		});
		
		it('renders one item per choice', function () {
			assertChoices();
			makeChoice(currentChoices[0]);
			assertChoices();
		});
		
		it('clicking on a choice sends an event in the task', function () {
			var choice = currentChoices[0];
			
			makeChoice(choice);
			assertChoiceMade(choice);
		});
		
		function assertChoices() {
			domContext.assertElementCount('.monopoly-game-choices-item', currentChoices.length);
			
			_.each(currentChoices, function (choice) {
				domContext.assertOneOf('.monopoly-game-choices-item[data-id=' + choice.id + ']');
			});
		}
		
		function makeChoice(choice) {
			domContext.clickOn('[data-id=' + choice.id + ']');
		}
		
		function assertChoiceMade(choice) {
			expect(choiceMade.id).to.eql(choice.id);
		}
	});
}());