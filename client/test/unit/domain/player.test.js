(function() {
	"use strict";
	
	var Player = require('./player');
	var Board = require('./board');
	
	var testData = require('./test-data');
	
	describe('A player', function () {
		var player;
		var board;
		
		beforeEach(function () {
			board = Board.standard();
			var players = Player.newPlayers(
				testData.playersConfiguration(),
				board.playerParameters());
			player = players[0];
		});
		
		describe('at start', function () {
			it('is at position 0', function () {
				expect(player.position()).to.eql(0);
			});
			
			it('has the money specified in the board to start with', function () {
				expect(player.money()).to.eql(board.playerParameters().startMoney);
			});
			
			it('starts with an empty list of properties', function () {
				expect(player.properties()).to.eql([]);
			});
			
			it('has a net worth of [startMoney] (since no properties)', function () {
				expect(player.netWorth()).to.eql(board.playerParameters().startMoney);
			});
		});
		
		describe('when lapping around the board', function () {
			var movedPlayer;
			
			beforeEach(function () {
				movedPlayer = player.move([0,board.squares().length]);
			});
			
			it('wraps around the board', function () {
				expect(movedPlayer.position()).to.eql(0);
			});
			
			it('earns a salary', function () {
				expect(movedPlayer.money()).to.eql(player.money() + board.playerParameters().salary);
			});
		});
		
		describe('when buying property', function () {
			var PROPERTY;
			var newPlayer;
			
			beforeEach(function () {
				PROPERTY = board.properties().mediterranean;
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
				
				newPlayer = newPlayer.buyProperty(board.properties().shortRailroad);
				
				expect(newPlayer.properties()[0].equals(PROPERTY)).to.be(true);
				expect(newPlayer.properties()[1].equals(board.properties().shortRailroad)).to.be(true);
				
				newPlayer = newPlayer.buyProperty(board.properties().broadwalk);
				
				expect(newPlayer.properties()[0].equals(PROPERTY)).to.be(true);
				expect(newPlayer.properties()[1].equals(board.properties().broadwalk)).to.be(true);
				expect(newPlayer.properties()[2].equals(board.properties().shortRailroad)).to.be(true);
				
				newPlayer = newPlayer.buyProperty(board.properties().connecticut);
				
				expect(newPlayer.properties()[0].equals(PROPERTY)).to.be(true);
				expect(newPlayer.properties()[1].equals(board.properties().connecticut)).to.be(true);
				expect(newPlayer.properties()[2].equals(board.properties().broadwalk)).to.be(true);
				expect(newPlayer.properties()[3].equals(board.properties().shortRailroad)).to.be(true);
			});
		});
		
		describe('when gaining property', function () {
			var PROPERTY;
			var newPlayer;
			
			beforeEach(function () {
				PROPERTY = board.properties().mediterranean;
				newPlayer = player.gainProperty(PROPERTY);
			});
			
			it('money stays the same', function () {
				expect(newPlayer.money()).to.eql(player.money());
			});
			
			it('insert them in order', function () {
				expect(newPlayer.properties()[0].equals(PROPERTY)).to.be(true);
				
				newPlayer = newPlayer.gainProperty(board.properties().shortRailroad);
				
				expect(newPlayer.properties()[0].equals(PROPERTY)).to.be(true);
				expect(newPlayer.properties()[1].equals(board.properties().shortRailroad)).to.be(true);
				
				newPlayer = newPlayer.gainProperty(board.properties().broadwalk);
				
				expect(newPlayer.properties()[0].equals(PROPERTY)).to.be(true);
				expect(newPlayer.properties()[1].equals(board.properties().broadwalk)).to.be(true);
				expect(newPlayer.properties()[2].equals(board.properties().shortRailroad)).to.be(true);
				
				newPlayer = newPlayer.gainProperty(board.properties().connecticut);
				
				expect(newPlayer.properties()[0].equals(PROPERTY)).to.be(true);
				expect(newPlayer.properties()[1].equals(board.properties().connecticut)).to.be(true);
				expect(newPlayer.properties()[2].equals(board.properties().broadwalk)).to.be(true);
				expect(newPlayer.properties()[3].equals(board.properties().shortRailroad)).to.be(true);
			});
		});
		
		describe('when losing property', function () {
			var PROPERTY;
			var newPlayer;
			
			beforeEach(function () {
				PROPERTY = board.properties().mediterranean;
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
			var AMOUNT = 100;
			var newPlayer = player.pay(AMOUNT);
			
			expect(newPlayer.money()).to.eql(player.money() - AMOUNT);
		});
		
		it('cannot pay enough money to fall at 0', function () {
			var pay = function () {
				player.pay(board.startMoney());
			};
			
			expect(pay).to.throwError();
		});
		
		it('adds the money when earning it', function () {
			var AMOUNT = 100;
			var newPlayer = player.earn(AMOUNT);
			
			expect(newPlayer.money()).to.eql(player.money() + AMOUNT);
		});
		
		describe('when sending to jail', function () {
			var newPlayer;
			
			beforeEach(function () {
				newPlayer = player.jail();
			});
			
			it('position becomes jail position', function () {
				expect(newPlayer.position()).to.eql(board.playerParameters().jailPosition);
			});
			
			it('becomes jailed', function () {
				expect(newPlayer.jailed()).to.be(true);
			});
		});
	});
}());