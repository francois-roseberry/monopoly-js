(function() {
	"use strict";
	
	var ConfigureGameTask = require('./configure-game-task');
	
	describe('A ConfigureGameTask', function () {
		var task;
		
		beforeEach(function () {
			task = ConfigureGameTask.start();
		});
		
		it('at start, has 1 computer player', function () {
			expect(task.getComputers()).to.eql(1);
		});
		
		it('when starting game, sends a completed event with the players', function (done) {
			task.completed().subscribe(function (players) {
				expect(players).to.eql([
					{ type: 'human' },
					{ type: 'computer' },
					{ type: 'computer' }
				]);
			}, done, done);
			
			task.setComputers(2);
			task.startGame();
		});
	});
}());