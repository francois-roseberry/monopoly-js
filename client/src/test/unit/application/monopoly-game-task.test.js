(function() {
	"use strict";
	
	var MonopolyGameTask = require('./monopoly-game-task');
	
	describe('A Monopoly game task', function () {
		var task;
		
		beforeEach(function () {
			task = MonopolyGameTask.start();
		});
		
		it('send a configuring status at start', function (done) {
			task.statusChanged().take(1).subscribe(function (status) {
				expect(status.statusName).to.eql('configuring');
			}, done, done);
		});
		
		it('send a playing status when starting game', function (done) {
			task.statusChanged().skip(1).take(1).subscribe(function (status) {
				expect(status.statusName).to.eql('playing');
			}, done, done);
			
			task.startGame();
		});
	});
}());