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
		
		it('starts with an empty list of properties', function () {
			expect(players[0].properties()).to.eql([]);
		});
		
		it('wraps around the board when moving past the end', function () {
			var movedPlayer = players[0].move([0,3], 2);
			
			expect(movedPlayer.position()).to.eql(1);
		});
		
		describe('when buying property', function () {
			var PROPERTY_ID = 'id';
			var PRICE = 200;
			var newPlayer;
			
			beforeEach(function () {
				newPlayer = players[0].buyProperty(PROPERTY_ID, PRICE);
			});
			
			it('substract the price', function () {
				expect(newPlayer.money()).to.eql(players[0].money() - PRICE);
			});
			
			it('add it to the list', function () {
				expect(newPlayer.properties()).to.eql(players[0].properties().concat([PROPERTY_ID]));
			});
		});
	});
}());