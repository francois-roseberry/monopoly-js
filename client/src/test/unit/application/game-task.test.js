(function() {
	"use strict";
	
	var Square = require('./square');
	var GameTask = require('./game-task');
	
	describe('A Monopoly game task', function () {
		var task;
		
		beforeEach(function () {
			task = GameTask.start();
		});
		
		it('send a configuring status at start', function (done) {
			task.statusChanged().take(1).subscribe(function (status) {
				expect(status.statusName).to.eql('configuring');
			}, done, done);
		});
		
		it('send a playing status when starting game with a square', function (done) {
			task.startGame();
			
			task.statusChanged().take(1).subscribe(function (status) {
				expect(status.statusName).to.eql('playing');
				status.match({
					'playing': function (square) {
						expect(square).to.eql(Square.SQUARES);
					}
				});
			}, done, done);
		});
		
		it('never sends two playing statuses in a row', function () {
			task.statusChanged().skip(2).take(1).subscribe(function (status) {
				throw new Error('should never send a second playing status');
			});
			
			task.startGame();
			task.startGame();
		});
		
		it('sends a configuring status when creating new game', function (done) {
			task.startGame();
			task.newGame();
			
			task.statusChanged().take(1).subscribe(function (status) {
				expect(status.statusName).to.eql('configuring');
			}, done, done);
		});
	});
}());