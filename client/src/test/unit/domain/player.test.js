(function() {
	"use strict";
	
	var Player = require('./player');
	var Board = require('./board');
	
	var testData = require('./test-data');
	
	describe('A player', function () {
		var player;
		
		beforeEach(function () {
			var players = Player.newPlayers(testData.playersConfiguration());
			player = players[0];
		});
		
		describe('at start', function () {
			it('is at position 0', function () {
				expect(player.position()).to.eql(0);
			});
			
			it('has 1500$', function () {
				expect(player.money()).to.eql(1500);
			});
			
			it('starts with an empty list of properties', function () {
				expect(player.properties()).to.eql([]);
			});
			
			it('has a net worth of 1500$ (since no properties)', function () {
				expect(player.netWorth()).to.eql(1500);
			});
		});
		
		it('wraps around the board when moving past the end', function () {
			var movedPlayer = player.move([0,40]);
			
			expect(movedPlayer.position()).to.eql(0);
		});
		
		it('earns 200$ when wrapping around the board', function () {
			var movedPlayer = player.move([0,40]);
			
			expect(movedPlayer.money()).to.eql(player.money() + 200);
		});
		
		describe('when buying property', function () {
			var PROPERTY = Board.properties().mediterranean;
			var newPlayer;
			
			beforeEach(function () {
				newPlayer = player.buyProperty(PROPERTY);
			});
			
			it('substract the price', function () {
				expect(newPlayer.money()).to.eql(player.money() - PROPERTY.price());
			});
			
			it('net worth is still the same (since property value is added to money)', function () {
				expect(newPlayer.netWorth()).to.eql(player.netWorth());
			});
			
			it('insert them in order', function () {
				expect(newPlayer.properties()[0].equals(PROPERTY)).to.be(true);
				
				newPlayer = newPlayer.buyProperty(Board.properties().shortRailroad);
				
				expect(newPlayer.properties()[0].equals(PROPERTY)).to.be(true);
				expect(newPlayer.properties()[1].equals(Board.properties().shortRailroad)).to.be(true);
				
				newPlayer = newPlayer.buyProperty(Board.properties().broadwalk);
				
				expect(newPlayer.properties()[0].equals(PROPERTY)).to.be(true);
				expect(newPlayer.properties()[1].equals(Board.properties().broadwalk)).to.be(true);
				expect(newPlayer.properties()[2].equals(Board.properties().shortRailroad)).to.be(true);
				
				newPlayer = newPlayer.buyProperty(Board.properties().connecticut);
				
				expect(newPlayer.properties()[0].equals(PROPERTY)).to.be(true);
				expect(newPlayer.properties()[1].equals(Board.properties().connecticut)).to.be(true);
				expect(newPlayer.properties()[2].equals(Board.properties().broadwalk)).to.be(true);
				expect(newPlayer.properties()[3].equals(Board.properties().shortRailroad)).to.be(true);
			});
		});
		
		describe('when gaining property', function () {
			var PROPERTY = Board.properties().mediterranean;
			var newPlayer;
			
			beforeEach(function () {
				newPlayer = player.gainProperty(PROPERTY);
			});
			
			it('money stays the same', function () {
				expect(newPlayer.money()).to.eql(player.money());
			});
			
			it('insert them in order', function () {
				expect(newPlayer.properties()[0].equals(PROPERTY)).to.be(true);
				
				newPlayer = newPlayer.gainProperty(Board.properties().shortRailroad);
				
				expect(newPlayer.properties()[0].equals(PROPERTY)).to.be(true);
				expect(newPlayer.properties()[1].equals(Board.properties().shortRailroad)).to.be(true);
				
				newPlayer = newPlayer.gainProperty(Board.properties().broadwalk);
				
				expect(newPlayer.properties()[0].equals(PROPERTY)).to.be(true);
				expect(newPlayer.properties()[1].equals(Board.properties().broadwalk)).to.be(true);
				expect(newPlayer.properties()[2].equals(Board.properties().shortRailroad)).to.be(true);
				
				newPlayer = newPlayer.gainProperty(Board.properties().connecticut);
				
				expect(newPlayer.properties()[0].equals(PROPERTY)).to.be(true);
				expect(newPlayer.properties()[1].equals(Board.properties().connecticut)).to.be(true);
				expect(newPlayer.properties()[2].equals(Board.properties().broadwalk)).to.be(true);
				expect(newPlayer.properties()[3].equals(Board.properties().shortRailroad)).to.be(true);
			});
		});
		
		describe('when losing property', function () {
			var PROPERTY = Board.properties().mediterranean;
			var newPlayer;
			
			beforeEach(function () {
				newPlayer = player.gainProperty(PROPERTY).loseProperty(PROPERTY);
			});
			
			it('money stays the same', function () {
				expect(newPlayer.money()).to.eql(player.money());
			});
			
			it('property lost is not in the player properties list', function () {
				expect(newPlayer.properties().length).to.eql(0);
			});
		});
		
		it('substracts the money when paying it', function () {
			var amount = 100;
			var newPlayer = player.pay(amount);
			
			expect(newPlayer.money()).to.eql(1500 - amount);
		});
		
		it('cannot pay enough money to fall at 0', function () {
			var amount = 1500;
			
			var pay = function () {
				player.pay(amount);
			};
			
			expect(pay).to.throwError();
		});
		
		it('adds the money when earning it', function () {
			var amount = 100;
			var newPlayer = player.earn(amount);
			
			expect(newPlayer.money()).to.eql(1500 + amount);
		});
	});
}());