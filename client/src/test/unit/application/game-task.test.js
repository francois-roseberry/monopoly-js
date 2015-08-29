(function() {
	"use strict";
	
	var Board = require('./board');
	var GameTask = require('./game-task');
	
	describe('A Game task', function () {
		var configureGameTask;
		var task;
		
		beforeEach(function (done) {
			task = GameTask.start();
			task.statusChanged().take(1).subscribe(function (status) {
				status.match({
					'configuring': function (task) {
						configureGameTask = task;
					}
				});
			}, done, done);
		});
		
		it('send a configuring status at start', function (done) {
			task.statusChanged().take(1).subscribe(function (status) {
				expect(status.statusName).to.eql('configuring');
			}, done, done);
		});
		
		it('send a playing status when its configure game task is completed', function (done) {
			configureGameTask.startGame();
			
			task.statusChanged().take(1).subscribe(function (status) {
				expect(status.statusName).to.eql('playing');
				status.match({
					'playing': function (playGameTask) {
						playGameTask.gameState().take(1).subscribe(function (state) {
							expect(state.squares).to.eql(Board.squares());
							expect(state.players.length).to.eql(configureGameTask.getComputers().length + 1);
						});
					}
				});
			}, done, done);
		});
		
		it('sends a configuring status when its play game task is completed', function (done) {
			configureGameTask.startGame();
			
			task.statusChanged().take(1).subscribe(function (status) {
				status.match({
					'playing': function (playGameTask) {
						playGameTask.stop();
					}
				});
			});
			
			task.statusChanged().skip(1).take(1).subscribe(function (status) {
				expect(status.statusName).to.eql('configuring');
			}, done, done);
		});
	});
}());