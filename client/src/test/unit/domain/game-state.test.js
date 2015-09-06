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
			
			assertChoices(state, [Choices.rollDice().id]);
		});
	});
	
	describe('A turnEnd state', function () {
		it('offers the finish-turn choice', function () {
			var state = turnEndStateAtStartPosition();
			
			assertChoices(state, [Choices.finishTurn().id]);
		});
		
		it('when current player is on an estate, offers to buy it', function () {
			var state = turnEndStateOnEstate();
			
			assertChoices(state, [Choices.buyProperty().id, Choices.finishTurn().id]);
		});
		
		it('when current player is on a railroad, offers to buy it', function () {
			var state = turnEndStateOnRailroad();
			
			assertChoices(state, [Choices.buyProperty().id, Choices.finishTurn().id]);
		});
		
		it('when current player is on a company, offers to buy it', function () {
			var state = turnEndStateOnCompany();
			
			assertChoices(state, [Choices.buyProperty().id, Choices.finishTurn().id]);
		});
		
		it('when current player is on a property that is owned, does not offer to buy it', function () {
			var state = turnEndStateOnOwnedEstate();
			
			assertChoices(state, [Choices.finishTurn().id]);
		});
		
		it('when current player is on a property that is too expensive, does not offer to buy it', function () {
			var state = turnEndStateBrokeOnEstate();
			
			assertChoices(state, [Choices.finishTurn().id]);
		});
	});
	
	function assertChoices(state, choiceIds) {
		expect(toChoiceIds(state.choices())).to.eql(choiceIds);
	}
	
	function turnEndStateAtStartPosition() {
		return turnEndStateWithPlayers(testData.players());
	}
	
	function turnEndStateOnEstate() {
		return turnEndStateWithPlayers(playerOnEstate());
	}
	
	function turnEndStateOnRailroad() {
		return turnEndStateWithPlayers(playerOnRailroad());
	}
	
	function turnEndStateOnCompany() {
		return turnEndStateWithPlayers(playerOnCompany());
	}
	
	function turnEndStateOnOwnedEstate() {
		return turnEndStateWithPlayers(playerOnOwnedEstate());
	}
	
	function turnEndStateBrokeOnEstate() {
		return turnEndStateWithPlayers(playerBrokeOnEstate());
	}
	
	function turnEndStateWithPlayers(players) {
		return GameState.turnEndState({
			squares: Board.squares(),
			players: players,
			currentPlayerIndex: 0
		});
	}
	
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
	
	function playerOnOwnedEstate() {
		var players = testData.players();
		return [players[0].move([0, 1], 40).buyProperty('med', 1), players[1], players[2]];
	}
	
	function playerBrokeOnEstate() {
		var players = testData.players();
		return [players[0].buyProperty('vn', players[0].money() - 1).move([0, 1], 40), players[1], players[2]];
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