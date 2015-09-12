(function() {
	"use strict";
	
	var ConfigureGameTask = require('./configure-game-task');
	
	describe('A ConfigureGameTask', function () {
		var task;
		
		beforeEach(function () {
			task = ConfigureGameTask.start();
		});
		
		it('at start, has 2 computer players', function (done) {
			task.players().take(1).subscribe(function (players) {
				expect(players).to.eql([
					{ type: 'human' },
					{ type: 'computer' },
					{ type: 'computer' }
				]);
			}, done, done);
		});
		
		it('when setting computer players, sends an event', function (done) {
			task.setComputers(2);
			
			task.players().take(1).subscribe(function (players) {
				expect(players).to.eql([
					{ type: 'human' },
					{ type: 'computer' },
					{ type: 'computer' }
				]);
			}, done, done);
		});
		
		it('when starting game, sends a completed event with the players', function (done) {
			task.completed().subscribe(_.noop, done, done);
			
			task.startGame();
		});
	});
}());