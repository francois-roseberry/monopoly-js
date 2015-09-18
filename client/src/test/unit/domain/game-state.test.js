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
			var state = turnEndStateWithPlayers(testData.players());
			
			assertChoices(state, [Choices.finishTurn()]);
		});
		
		it('when current player is on an estate, offers to buy it', function () {
			assertBuyPropertyChoiceWhenOnPropertyWithoutOwner();
		});
		
		it('when current player is on a property that is owned, does not offer to buy it', function () {
			var state = turnEndStateWithPlayers(playerOnOwnedEstate());
			
			assertChoices(state, [Choices.finishTurn()]);
		});
		
		it('when current player is on a property that is too expensive, does not offer to buy it', function () {
			var state = turnEndStateWithPlayers(playerBrokeOnEstate());
			
			assertChoices(state, [Choices.finishTurn()]);
		});
		
		describe('when current player is on property owned by other player, offers to pay the rent of ', function () {
			it('estate rent if that property is an estate', function () {
				assertRentToPayIsEstateRent();
			});
			
			it('25$ if that property is a railroad and owner possess 1 railroad', function () {
				var state = turnEndStateWithPlayers(playerOnRailroadOwnedByOtherWithOneRailroad());
				var secondPlayer = testData.players()[1];
				
				assertChoices(state, [Choices.payRent(25, secondPlayer.id(), secondPlayer.name())]);
			});
			
			it('50$ if that property is a railroad and owner possess 2 railroads', function () {
				var state = turnEndStateWithPlayers(playerOnRailroadOwnedByOtherWithTwoRailroads());
				var secondPlayer = testData.players()[1];
				
				assertChoices(state, [Choices.payRent(50, secondPlayer.id(), secondPlayer.name())]);
			});
			
			it('100$ if that property is a railroad and owner possess 3 railroads', function () {
				var state = turnEndStateWithPlayers(playerOnRailroadOwnedByOtherWithThreeRailroads());
				var secondPlayer = testData.players()[1];
				
				assertChoices(state, [Choices.payRent(100, secondPlayer.id(), secondPlayer.name())]);
			});
			
			it('200$ if that property is a railroad and owner possess 4 railroads', function () {
				var state = turnEndStateWithPlayers(playerOnRailroadOwnedByOtherWithFourRailroads());
				var secondPlayer = testData.players()[1];
				
				assertChoices(state, [Choices.payRent(200, secondPlayer.id(), secondPlayer.name())]);
			});
			
			it('25$ if that property is a company', function () {
				var state = turnEndStateWithPlayers(playerOnCompanyOwnedByOther());
				var secondPlayer = testData.players()[1];
				
				assertChoices(state, [Choices.payRent(25, secondPlayer.id(), secondPlayer.name())]);
			});
		});
		
		it('when current player is on property owned by other player, but already paid, ' +
			'does not offer to pay the rent again', function () {
				assertNoPayRentChoiceWhenAlreadyPaidPropertyRent();
		});
		
		it('when current player is on property owned by other player, but rent is too high, ' +
			'offers bankruptcy', function () {
				assertBankruptcyChoiceWhenPropertyRentIsTooHigh();
		});
	});
	
	function assertBuyPropertyChoiceWhenOnPropertyWithoutOwner() {
		assertBuyPropertyChoiceWhenOnEstateWithoutOwner();
		assertBuyPropertyChoiceWhenOnRailroadWithoutOwner();
		assertBuyPropertyChoiceWhenOnCompanyWithoutOwner();
	}
	
	function assertBuyPropertyChoiceWhenOnEstateWithoutOwner() {
		var state = turnEndStateWithPlayers(playerOnEstate());
		assertChoices(state, [Choices.buyProperty('med','',60), Choices.finishTurn()]);
	}
	
	function assertBuyPropertyChoiceWhenOnRailroadWithoutOwner() {
		var state = turnEndStateWithPlayers(playerOnRailroad());
		assertChoices(state, [Choices.buyProperty('rr-reading','',200), Choices.finishTurn()]);
	}
	
	function assertBuyPropertyChoiceWhenOnCompanyWithoutOwner() {
		var state = turnEndStateWithPlayers(playerOnCompany());
		assertChoices(state, [Choices.buyProperty('electric','',150), Choices.finishTurn()]);
	}
	
	function assertNoPayRentChoiceWhenAlreadyPaidPropertyRent() {
		assertNoPayRentChoiceWhenAlreadyPaidEstateRent();
		assertNoPayRentChoiceWhenAlreadyPaidRailroadRent();
		assertNoPayRentChoiceWhenAlreadyPaidCompanyRent();
	}
	
	function assertNoPayRentChoiceWhenAlreadyPaidEstateRent() {
		var state = turnEndStateWithPlayers(playerOnEstateOwnedByOther(), true);
		assertChoices(state, [Choices.finishTurn()]);
	}
	
	function assertNoPayRentChoiceWhenAlreadyPaidRailroadRent() {
		var state = turnEndStateWithPlayers(playerOnRailroadOwnedByOtherWithOneRailroad(), true);
		assertChoices(state, [Choices.finishTurn()]);
	}
	
	function assertNoPayRentChoiceWhenAlreadyPaidCompanyRent() {
		var state = turnEndStateWithPlayers(playerOnCompanyOwnedByOther(), true);
		assertChoices(state, [Choices.finishTurn()]);
	}
	
	function assertBankruptcyChoiceWhenPropertyRentIsTooHigh() {
		assertBankruptcyChoiceWhenEstateRentIsTooHigh();
		assertBankruptcyChoiceWhenRailroadRentIsTooHigh();
		assertBankruptcyChoiceWhenCompanyRentIsTooHigh();
	}
	
	function assertBankruptcyChoiceWhenEstateRentIsTooHigh() {
		var state = turnEndStateWithPlayers(playerWithAlmostNoMoneyOnEstateOwnedByOther());
		assertChoices(state, [Choices.goBankrupt()]);
	}
	
	function assertBankruptcyChoiceWhenRailroadRentIsTooHigh() {
		var state = turnEndStateWithPlayers(playerWithAlmostNoMoneyOnRailroadOwnedByOther());
		assertChoices(state, [Choices.goBankrupt()]);
	}
	
	function assertBankruptcyChoiceWhenCompanyRentIsTooHigh() {
		var state = turnEndStateWithPlayers(playerWithAlmostNoMoneyOnCompanyOwnedByOther());
		assertChoices(state, [Choices.goBankrupt()]);
	}
	
	function assertRentToPayIsEstateRent() {
		assertRentIsMediterraneanAvenueRent();
		assertRentIsBroadwalkRent();
	}
	
	function assertRentIsMediterraneanAvenueRent() {
		var state = turnEndStateWithPlayers(playerOnEstateOwnedByOther('med'));
		var secondPlayer = testData.players()[1];
				
		assertChoices(state, [Choices.payRent(2, secondPlayer.id(), secondPlayer.name())]);
	}
	
	function assertRentIsBroadwalkRent() {
		var state = turnEndStateWithPlayers(playerOnEstateOwnedByOther('bw', 39));
		var secondPlayer = testData.players()[1];
				
		assertChoices(state, [Choices.payRent(50, secondPlayer.id(), secondPlayer.name())]);
	}
	
	function assertChoices(state, choices) {
		_.each(state.choices(), function (choice, index) {
			expect(choice.equals(choices[index])).to.be(true);
		});
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
	
	function playerOnEstateOwnedByOther(propertyId, squareIndex) {
		var players = testData.players();
		return [players[0].move([0, squareIndex || 1], 40), players[1].buyProperty(propertyId || 'med', 1), players[2]];
	}
	
	function playerOnRailroadOwnedByOtherWithOneRailroad() {
		var players = testData.players();
		var owner = players[1].buyProperty('rr-reading', 1);
		return [players[0].move([0, 5], 40), owner, players[2]];
	}
	
	function playerOnRailroadOwnedByOtherWithTwoRailroads() {
		var players = testData.players();
		var owner = players[1].buyProperty('rr-reading', 1).buyProperty('rr-penn', 1);
		return [players[0].move([0, 5], 40), owner, players[2]];
	}
	
	function playerOnRailroadOwnedByOtherWithThreeRailroads() {
		var players = testData.players();
		var owner = players[1].buyProperty('rr-reading', 1)
			.buyProperty('rr-penn', 1)
			.buyProperty('rr-bo', 1);
		return [players[0].move([0, 5], 40), owner, players[2]];
	}
	
	function playerOnRailroadOwnedByOtherWithFourRailroads() {
		var players = testData.players();
		var owner = players[1].buyProperty('rr-reading', 1)
			.buyProperty('rr-penn', 1)
			.buyProperty('rr-bo', 1)
			.buyProperty('rr-short', 1);
		return [players[0].move([0, 5], 40), owner, players[2]];
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
	
	function turnStartState() {
		return GameState.turnStartState({
			squares: Board.squares(),
			players: testData.players(),
			currentPlayerIndex: 0
		});
	}
}());