(function() {
	"use strict";
	
	var Board = require('./board');
	var GameChoicesWidget = require('./game-choices-widget');
	var PlayGameTask = require('./play-game-task');
	
	var testPlayers = require('./test-players');
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A game choices widget', function (domContext) {
		var initialChoices;
		
		beforeEach(function (done) {
			var task = PlayGameTask.start(Board.SQUARES, testPlayers.PLAYERS);
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
	});
}());