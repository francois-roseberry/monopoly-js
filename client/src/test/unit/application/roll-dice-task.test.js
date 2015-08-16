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
		
		it('send multiple diceRolled events', function (done) {
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