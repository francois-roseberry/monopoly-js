(function() {
	"use strict";
	
	var ConfigureGameTask = require('./configure-game-task');
	
	describe('A ConfigureGameTask', function () {
		var task;
		
		beforeEach(function () {
			task = ConfigureGameTask.start();
		});
		
		it('the available player types are human and computer', function () {
			expect(task.availablePlayerTypes()).to.eql(['human', 'computer']);
		});
		
		it('at start, creates 3 player slots', function (done) {
			task.playerSlots().take(1).subscribe(function (slots) {
				expect(slots).to.eql([
					{ type: 'human' },
					{ type: 'computer' },
					{ type: 'computer' }
				]);
			}, done, done);
		});
		
		it('adding a player slot sends an event', function (done) {
			task.playerSlots().skip(1).take(1).subscribe(function (slots) {
				expect(slots.length).to.eql(4);
				expect(slots[3]).to.eql({ type: 'computer' });
			}, done, done);
			
			task.addPlayerSlot('computer');
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
		
		it('when starting game, sends a completed event', function (done) {
			task.completed().subscribe(_.noop, done, done);
			
			task.startGame();
		});
		
		it('when starting game, completes the playerSlots event', function (done) {
			task.playerSlots().last().subscribe(_.noop, _.noop, done);
			
			task.startGame();
		});
	});
}());