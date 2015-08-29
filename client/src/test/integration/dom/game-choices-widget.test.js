(function() {
	"use strict";
	
	var Choices = require('./choices');
	var Board = require('./board');
	var GameChoicesWidget = require('./game-choices-widget');
	var PlayGameTask = require('./play-game-task');
	
	var testPlayers = require('./test-players');
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A game choices widget', function (domContext) {
		var initialChoices;
		var task;
		
		beforeEach(function (done) {
			task = PlayGameTask.start(Board.squares(), testPlayers.PLAYERS).handleChoicesTask();
			GameChoicesWidget.render(domContext.rootElement, task);
			
			task.choices().take(1).subscribe(function (choices) {
				initialChoices = choices;
			}, done, done);
		});
		
		it('is rendered in the given container', function () {
			domContext.assertOneOf('.monopoly-game-choices');
		});
		
		it('renders one item per choice', function () {
			domContext.assertElementCount('.monopoly-game-choices-item', initialChoices.length);
		});
		
		it('clicking on a choice sends an event in the task', function (done) {
			task.choiceMade().take(1).subscribe(function (choice) {
				expect(choice.id).to.eql(Choices.rollDice().id);
			}, done, done);
			
			domContext.clickOn('[data-id=' + Choices.rollDice().id + ']');
		});
	});
}());