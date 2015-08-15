(function() {
	"use strict";
	
	var RollDiceTask = require('./roll-dice-task');
	var DiceWidget = require('./dice-widget');
	
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A Dice widget', function (domContext) {
		var diceCount;

		beforeEach(function (done) {
			var task = RollDiceTask.start();
			DiceWidget.render(domContext.rootElement, task);
			
			task.diceRolled().take(1).subscribe(function (dice) {
				diceCount = dice.length;
			}, done, done);
		});
		
		it('is rendered in the correct div', function () {
			domContext.assertOneOf('.dice-container');
		});
		
		it('renders as many dice as the task sends', function () {
			domContext.assertElementCount('.die', diceCount);
		});
	});
}());