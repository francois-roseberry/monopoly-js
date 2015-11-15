(function() {
	"use strict";
	
	var ConfigureGameTask = require('./configure-game-task');
	
	describe('A ConfigureGameTask', function () {
		var task;
		var currentSlots = null;
		var completed = false;
		
		beforeEach(function () {
			task = ConfigureGameTask.start();
			
			task.playerSlots().subscribe(function (slots) {
				currentSlots = slots;
			}, _.noop, function () {
				completed = true;
			});
		});
		
		it('the available player types are human and computer', function () {
			expect(task.availablePlayerTypes()).to.eql(['human', 'computer']);
		});
		
		it('at start, creates 3 player slots', function () {
			expect(currentSlots).to.eql([
				{ type: 'human' },
				{ type: 'computer' },
				{ type: 'computer' }
			]);
		});
		
		it('adding a player slot sends an event', function () {
			task.addPlayerSlot('computer');
			
			expect(currentSlots.length).to.eql(4);
			expect(currentSlots[3]).to.eql({ type: 'computer' });
		});
		
		it('if there are at least 3 players, game configuration is valid', function (done) {
			task.configurationValid().take(1).subscribe(function (valid) {
				expect(valid).to.be(true);
			}, done, done);
		});
		
		it('if there are less than 3 players, configuration is invalid', function (done) {
			task.removePlayerSlot(2);
			
			task.configurationValid().take(1).subscribe(function (valid) {
				expect(valid).to.be(false);
			}, done, done);
		});
		
		it('if there are less than 8 players, can add new ones', function (done) {
			task.addPlayerSlot('computer');
			task.addPlayerSlot('computer');
			task.addPlayerSlot('computer');
			task.addPlayerSlot('computer');
			
			task.canAddPlayerSlot().take(1).subscribe(function (canAdd) {
				expect(canAdd).to.be(true);
			}, done, done);
		});
		
		it('if there are 8 players, cannot add anymore players', function (done) {
			task.addPlayerSlot('computer');
			task.addPlayerSlot('computer');
			task.addPlayerSlot('computer');
			task.addPlayerSlot('computer');
			task.addPlayerSlot('computer');
			
			task.canAddPlayerSlot().take(1).subscribe(function (canAdd) {
				expect(canAdd).to.be(false);
			}, done, done);
		});
		
		it('when starting game, completes the the task', function () {
			task.startGame();
			
			expect(completed).to.be(true);
		});
	});
}());