(function() {
	"use strict";
	
	var RollDiceTask = require('./roll-dice-task');
	
	describe('A RollDiceTask', function () {
		var task;
		
		beforeEach(function () {
			task = RollDiceTask.start();
		});
		
		it('at start, sends an event with two dice', function (done) {
			task.diceRolled().take(1).subscribe(function (dice) {
				expect(dice.length).to.eql(2);
			}, done, done);
		});
	});
}());