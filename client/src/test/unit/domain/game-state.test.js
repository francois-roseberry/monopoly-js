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
			
			assertChoices(state, [Choices.rollDice()]);
		});
	});
	
	describe('A turnEnd state', function () {
		it('offers the finish-turn choice', function () {
			var state = turnEndStateAtStartPosition();
			
			assertChoices(state, [Choices.finishTurn()]);
		});
		
		it('when current player is on an estate, offers to buy it', function () {
			var state = turnEndStateOnEstate();
			
			assertChoices(state, [Choices.buyProperty('med','',60), Choices.finishTurn()]);
		});
		
		it('when current player is on a railroad, offers to buy it', function () {
			var state = turnEndStateOnRailroad();
			
			assertChoices(state, [Choices.buyProperty('rr-reading','',200), Choices.finishTurn()]);
		});
		
		it('when current player is on a company, offers to buy it', function () {
			var state = turnEndStateOnCompany();
			
			assertChoices(state, [Choices.buyProperty('electric','',150), Choices.finishTurn()]);
		});
		
		it('when current player is on a property that is owned, does not offer to buy it', function () {
			var state = turnEndStateOnOwnedEstate();
			
			assertChoices(state, [Choices.finishTurn()]);
		});
		
		it('when current player is on a property that is too expensive, does not offer to buy it', function () {
			var state = turnEndStateBrokeOnEstate();
			
			assertChoices(state, [Choices.finishTurn()]);
		});
		
		describe('when current player is on property owned by other player, offers to pay the rent', function () {
			it('if that property is an estate', function () {
				var state = turnEndStateOnEstateOwnedByOther();
				var secondPlayer = testData.players()[1];
				
				assertChoices(state, [Choices.payRent(25, secondPlayer.id(), secondPlayer.name())]);
			});
			
			it('if that property is a railroad', function () {
				var state = turnEndStateOnRailroadOwnedByOther();
				var secondPlayer = testData.players()[1];
				
				assertChoices(state, [Choices.payRent(25, secondPlayer.id(), secondPlayer.name())]);
			});
			
			it('if that property is a company', function () {
				var state = turnEndStateOnCompanyOwnedByOther();
				var secondPlayer = testData.players()[1];
				
				assertChoices(state, [Choices.payRent(25, secondPlayer.id(), secondPlayer.name())]);
			});
		});
		
		describe('when current player is on property owned by other player, but already paid, ' +
			'does not offer to pay the rent again', function () {
			it('if that property is an estate', function () {
				var state = turnEndStateOnEstateOwnedByOtherButAlreadyPaid();
				
				assertChoices(state, [Choices.finishTurn()]);
			});
			
			it('if that property is a railroad', function () {
				var state = turnEndStateOnRailroadOwnedByOtherButAlreadyPaid();
				
				assertChoices(state, [Choices.finishTurn()]);
			});
			
			it('if that property is a company', function () {
				var state = turnEndStateOnCompanyOwnedByOtherButAlreadyPaid();
				
				assertChoices(state, [Choices.finishTurn()]);
			});
		});
		
		describe('when current player is on property owned by other player, but rent is too high, ' +
			'offers bankruptcy', function () {
			it('if that property is an estate', function () {
				var state = turnEndStateOnEstateOwnedByOtherButCannotPayRent();
				
				assertChoices(state, [Choices.goBankrupt()]);
			});
			
			it('if that property is a railroad', function () {
				var state = turnEndStateOnRailroadOwnedByOtherButCannotPayRent();
				
				assertChoices(state, [Choices.goBankrupt()]);
			});
			
			it('if that property is a company', function () {
				var state = turnEndStateOnCompanyOwnedByOtherButCannotPayRent();
				
				assertChoices(state, [Choices.goBankrupt()]);
			});
		});
	});
	
	function assertChoices(state, choices) {
		_.each(state.choices(), function (choice, index) {
			expect(choice.equals(choices[index])).to.be(true);
		});
		//expect(toChoiceIds(state.choices())).to.eql(choiceIds);
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
	
	function turnEndStateOnEstateOwnedByOther() {
		return turnEndStateWithPlayers(playerOnEstateOwnedByOther());
	}
	
	function turnEndStateOnRailroadOwnedByOther() {
		return turnEndStateWithPlayers(playerOnRailroadOwnedByOther());
	}
	
	function turnEndStateOnCompanyOwnedByOther() {
		return turnEndStateWithPlayers(playerOnCompanyOwnedByOther());
	}
	
	function turnEndStateOnEstateOwnedByOtherButAlreadyPaid() {
		return turnEndStateWithPlayers(playerOnEstateOwnedByOther(), true);
	}
	
	function turnEndStateOnRailroadOwnedByOtherButAlreadyPaid() {
		return turnEndStateWithPlayers(playerOnRailroadOwnedByOther(), true);
	}
	
	function turnEndStateOnCompanyOwnedByOtherButAlreadyPaid() {
		return turnEndStateWithPlayers(playerOnCompanyOwnedByOther(), true);
	}
	
	function turnEndStateOnEstateOwnedByOtherButCannotPayRent() {
		return turnEndStateWithPlayers(playerWithAlmostNoMoneyOnEstateOwnedByOther());
	}
	
	function turnEndStateOnRailroadOwnedByOtherButCannotPayRent() {
		return turnEndStateWithPlayers(playerWithAlmostNoMoneyOnRailroadOwnedByOther());
	}
	
	function turnEndStateOnCompanyOwnedByOtherButCannotPayRent() {
		return turnEndStateWithPlayers(playerWithAlmostNoMoneyOnCompanyOwnedByOther());
	}
	
	function turnEndStateWithPlayers(players, paid) {
		return GameState.turnEndState({
			squares: Board.squares(),
			players: players,
			currentPlayerIndex: 0
		}, paid);
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
	
	function playerOnEstateOwnedByOther() {
		var players = testData.players();
		return [players[0].move([0, 1], 40), players[1].buyProperty('med', 1), players[2]];
	}
	
	function playerOnRailroadOwnedByOther() {
		var players = testData.players();
		return [players[0].move([0, 5], 40), players[1].buyProperty('rr-reading', 1), players[2]];
	}
	
	function playerOnCompanyOwnedByOther() {
		var players = testData.players();
		return [players[0].move([0, 12], 40), players[1].buyProperty('electric', 1), players[2]];
	}
	
	function playerWithAlmostNoMoneyOnEstateOwnedByOther() {
		var players = testData.players();
		return [players[0].move([0, 1], 40).pay(1499), players[1].buyProperty('med', 1), players[2]];
	}
	
	function playerWithAlmostNoMoneyOnRailroadOwnedByOther() {
		var players = testData.players();
		return [players[0].move([0, 5], 40).pay(1499), players[1].buyProperty('rr-reading', 1), players[2]];
	}
	
	function playerWithAlmostNoMoneyOnCompanyOwnedByOther() {
		var players = testData.players();
		return [players[0].move([0, 12], 40).pay(1499), players[1].buyProperty('electric', 1), players[2]];
	}
	
	/*function toChoiceIds(choices) {
		return _.map(choices, function (choice) {
			return choice.id;
		});
	}*/
	
	function turnStartState() {
		return GameState.turnStartState({
			squares: Board.squares(),
			players: testData.players(),
			currentPlayerIndex: 0
		});
	}
}());