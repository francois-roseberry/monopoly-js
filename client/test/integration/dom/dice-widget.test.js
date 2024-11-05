(function() {
	"use strict";
	
	var RollDiceTask = require('./roll-dice-task');
	var DiceWidget = require('./dice-widget');
	
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A Dice widget', function (domContext) {
		var diceCount;
		var task;

		beforeEach(function (done) {
			task = RollDiceTask.start({ fast: true });
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
		
		it('removes itself when the task finishes rolling dice', function (done) {
			task.diceRolled().last().subscribe(function () {
				domContext.assertNothingOf('.dice-container');
			}, done, done);
		});
	});
}());