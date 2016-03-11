(function() {
	"use strict";
	
	var Board = require('./board');
	var GameTask = require('./game-task');
	
	describe('A Game task', function () {
		var task;
		var currentStatus;
		
		beforeEach(function () {
			task = GameTask.start();
			task.status().subscribe(function (status) {
				currentStatus = status;
			});
		});
		
		it('send a configuring status at start', function () {
			expect(currentStatus.statusName).to.eql('configuring');
		});
		
		it('send a playing status when its configure game task is completed', function (done) {
			var playerCount;
			
			currentStatus.match({
				'configuring': function (task) {
					task.playerSlots().take(1).subscribe(function (slots) {
						playerCount = slots.length;
					});
					
					task.startGame();
				}
			});
			
			expect(currentStatus.statusName).to.eql('playing');
			currentStatus.match({
				'playing': function (playGameTask) {
					playGameTask.gameState().take(1).subscribe(function (state) {
						expect(state.board().equals(Board.standard())).to.be(true);
						expect(state.players().length).to.eql(playerCount);
					}, done, done);
				}
			});
		});
		
		it('sends a configuring status when its play game task is completed', function () {
			currentStatus.match({
				'configuring': function (task) {
					task.startGame();
				}
			});
			
			currentStatus.match({
				'playing': function (playGameTask) {
					playGameTask.stop();
				}
			});
			
			expect(currentStatus.statusName).to.eql('configuring');
		});
	});
}());