(function() {
	"use strict";
	
	var Board = require('./board');
	var GameTask = require('./game-task');
	
	var testPlayers = require('./test-players');
	
	describe('A Game task', function () {
		var task;
		
		beforeEach(function () {
			task = GameTask.start();
		});
		
		it('send a configuring status at start', function (done) {
			task.statusChanged().take(1).subscribe(function (status) {
				expect(status.statusName).to.eql('configuring');
			}, done, done);
		});
		
		it('send a playing status when starting game with board and players', function (done) {
			task.startGame(testPlayers.PLAYERS);
			
			task.statusChanged().take(1).subscribe(function (status) {
				expect(status.statusName).to.eql('playing');
				status.match({
					'playing': function (playGameTask) {
						playGameTask.gameState().take(1).subscribe(function (state) {
							expect(state.squares).to.eql(Board.SQUARES);
							expect(state.players.length).to.eql(testPlayers.PLAYERS.length);
						});
					}
				});
			}, done, done);
		});
		
		it('never sends two playing statuses in a row', function () {
			task.statusChanged().skip(2).take(1).subscribe(function (status) {
				throw new Error('should never send a second playing status');
			});
			
			task.startGame(testPlayers.PLAYERS);
			task.startGame(testPlayers.PLAYERS);
		});
		
		it('sends a configuring status when its play game task is completed', function (done) {
			task.startGame(testPlayers.PLAYERS);
			
			task.statusChanged().take(1).subscribe(function (status) {
				status.match({
					'playing': function (playGameTask) {
						playGameTask.stop();
					}
				});
			});
			
			task.statusChanged().take(1).subscribe(function (status) {
				expect(status.statusName).to.eql('configuring');
			}, done, done);
		});
	});
}());