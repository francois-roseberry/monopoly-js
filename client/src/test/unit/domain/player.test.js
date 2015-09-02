(function() {
	"use strict";
	
	var Player = require('./player');
	
	var testData = require('./test-data');
	
	describe('A player', function () {
		var players;
		
		beforeEach(function () {
			players = Player.newPlayers(testData.playersConfiguration());
		});
		
		it('starts at position 0', function () {
			expect(players[0].position()).to.eql(0);
		});
		
		it('starts with 1500$', function () {
			expect(players[0].money()).to.eql(1500);
		});
		
		it('wraps around the board when moving past the end', function () {
			var movedPlayer = players[0].move([0,3], 2);
			
			expect(movedPlayer.position()).to.eql(1);
		});
	});
}());