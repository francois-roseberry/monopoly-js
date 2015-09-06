(function() {
	"use strict";
	
	var GameState = require('./game-state');
	var Board = require('./board');
	var Choices = require('./choices');
	
	var testData = require('./test-data');
	
	describe('Any game state', function () {
		it('can retrieve a property by its id', function () {
			var state = turnStartState();
			
			expect(state.propertyById('rr-reading').match({
				'railroad': function (id) { return id; }
			})).to.eql('rr-reading');
		});
	});
	
	describe('A turnStart state', function () {
		it('offers the roll-dice choice', function () {
			var state = turnStartState();
			
			expect(toChoiceIds(state.choices())).to.contain(Choices.rollDice().id);
		});
	});
	
	describe('A turnEnd state', function () {
		it('offers the finish-turn choice', function () {
			var state = GameState.turnEndState({
				squares: Board.squares(),
				players: testData.players(),
				currentPlayerIndex: 0
			});
			
			expect(toChoiceIds(state.choices())).to.eql([Choices.finishTurn().id]);
		});
		
		it('when current player is on an estate, offers to buy it', function () {
			var state = GameState.turnEndState({
				squares: Board.squares(),
				players: playerOnEstate(),
				currentPlayerIndex: 0
			});
			
			expect(toChoiceIds(state.choices())).to.eql([Choices.finishTurn().id, Choices.buyProperty().id]);
		});
		
		it('when current player is on a railroad, offers to buy it', function () {
			var state = GameState.turnEndState({
				squares: Board.squares(),
				players: playerOnRailroad(),
				currentPlayerIndex: 0
			});
			
			expect(toChoiceIds(state.choices())).to.eql([Choices.finishTurn().id, Choices.buyProperty().id]);
		});
		
		it('when current player is on a company, offers to buy it', function () {
			var state = GameState.turnEndState({
				squares: Board.squares(),
				players: playerOnCompany(),
				currentPlayerIndex: 0
			});
			
			expect(toChoiceIds(state.choices())).to.eql([Choices.finishTurn().id, Choices.buyProperty().id]);
		});
	});
	
	function playerOnEstate() {
		var players = testData.players();
		return [players[0].move([0, 1], 40), players[1], players[2]];
	}
	
	function playerOnRailroad() {
		var players = testData.players();
		return [players[0].move([0, 5], 40), players[1], players[2]];
	}
	
	function playerOnCompany() {
		var players = testData.players();
		return [players[0].move([0, 12], 40), players[1], players[2]];
	}
	
	function toChoiceIds(choices) {
		return _.map(choices, function (choice) {
			return choice.id;
		});
	}
	
	function turnStartState() {
		return GameState.turnStartState({
			squares: Board.squares(),
			players: testData.players(),
			currentPlayerIndex: 0
		});
	}
}());