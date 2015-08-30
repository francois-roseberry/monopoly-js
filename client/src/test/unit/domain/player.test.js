(function() {
	"use strict";
	
	var Player = require('./player');
	
	describe('A player', function () {
		var player;
		
		beforeEach(function () {
			player = Player.newPlayer({
				name: 'Player',
				money: 1,
				position : 0,
				color: 'red',
				type: 'human'
			});
		});
		
		it('wraps around the board when moving past the end', function () {
			var movedPlayer = player.move([0,3], 2);
			
			expect(movedPlayer.position()).to.eql(1);
		});
	});
}());