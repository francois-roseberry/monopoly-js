(function() {
	"use strict";
	
	var RollDiceTask = require('./roll-dice-task');
	
	describe('A RollDiceTask', function () {
		var task;
		
		beforeEach(function () {
			task = RollDiceTask.start({ fast: true });
		});
		
		it('diceRolled observable completes', function (done) {
			task.diceRolled().subscribe(function (dice) {
				expect(dice.length).to.eql(2);
				assertValidDie(dice[0]);
				assertValidDie(dice[1]);
			}, done, done);
		});
		
		function assertValidDie(die) {
			return die >= 1 && die <= 6;
		}
	});
}());