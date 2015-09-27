(function() {
	"use strict";
	
	var GameState = require('./game-state');
	var Board = require('./board');
	var Choices = require('./choices');
	
	var testData = require('./test-data');
	
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
			assertNoBuyPropertyChoiceWhenOnPropertyWithOwner();
		});
		
		it('when current player is on a property that is too expensive, does not offer to buy it', function () {
			assertNoBuyPropertyChoiceWhenOnPropertyTooExpensive();
		});
		
		describe('when current player is on property owned by other player, offers to pay the rent of ', function () {
			it('the estate rent if that property is an estate and owner does not own group', function () {
				assertRentToPayIsEstateRentWhenOwnerDoesNotOwnGroup();
			});
			
			it('double the estate rent if that property is an estate and owner owns group', function () {
				assertRentToPayIsDoubleTheEstateRentWhenOwnerOwnsGroup();
			});
			
			it('25$ if that property is a railroad and owner possess 1 railroad', function () {
				var state = turnEndStateWithPlayers(playerOnRailroadOwnedByOtherWithOneRailroad());
				var secondPlayer = testData.players()[1];
				
				assertChoices(state, [Choices.payRent(25, secondPlayer)]);
			});
			
			it('50$ if that property is a railroad and owner possess 2 railroads', function () {
				var state = turnEndStateWithPlayers(playerOnRailroadOwnedByOtherWithTwoRailroads());
				var secondPlayer = testData.players()[1];
				
				assertChoices(state, [Choices.payRent(50, secondPlayer)]);
			});
			
			it('100$ if that property is a railroad and owner possess 3 railroads', function () {
				var state = turnEndStateWithPlayers(playerOnRailroadOwnedByOtherWithThreeRailroads());
				var secondPlayer = testData.players()[1];
				
				assertChoices(state, [Choices.payRent(100, secondPlayer)]);
			});
			
			it('200$ if that property is a railroad and owner possess 4 railroads', function () {
				var state = turnEndStateWithPlayers(playerOnRailroadOwnedByOtherWithFourRailroads());
				var secondPlayer = testData.players()[1];
				
				assertChoices(state, [Choices.payRent(200, secondPlayer)]);
			});
			
			it('25$ if that property is a company', function () {
				var state = turnEndStateWithPlayers(playerOnCompanyOwnedByOther());
				var secondPlayer = testData.players()[1];
				
				assertChoices(state, [Choices.payRent(25, secondPlayer)]);
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
		
		it('when current player is on luxury-task, offers a 75$ tax', function () {
			var state = turnEndStateWithPlayers(playerOnLuxuryTax());
			
			assertChoices(state, [Choices.payTax(75)]);
		});
		
		it('when current player is broke on luxury-tax, offers bankruptcy', function () {
			var state = turnEndStateWithPlayers(playerBrokeOnLuxuryTax());
			
			assertChoices(state, [Choices.goBankrupt()]);
		});
		
		it('when current player is on luxury-tax, but already paid, does not ' +
			'offer to pay the tax again', function () {
				assertNoPayTaxChoiceWhenAlreadyPaidTax();
		});
	});
	
	function assertNoBuyPropertyChoiceWhenOnPropertyTooExpensive() {
		var state = turnEndStateWithPlayers(playerBrokeOnEstate());
		assertChoices(state, [Choices.finishTurn()]);
	}
	
	function assertNoBuyPropertyChoiceWhenOnPropertyWithOwner() {
		var state = turnEndStateWithPlayers(playerOnOwnedEstate());
		assertChoices(state, [Choices.finishTurn()]);
	}
	
	function assertBuyPropertyChoiceWhenOnPropertyWithoutOwner() {
		assertBuyPropertyChoiceWhenOnEstateWithoutOwner();
		assertBuyPropertyChoiceWhenOnRailroadWithoutOwner();
		assertBuyPropertyChoiceWhenOnCompanyWithoutOwner();
	}
	
	function assertBuyPropertyChoiceWhenOnEstateWithoutOwner() {
		var state = turnEndStateWithPlayers(playerOnEstate());
		assertChoices(state, [Choices.buyProperty(Board.properties().mediterranean), Choices.finishTurn()]);
	}
	
	function assertBuyPropertyChoiceWhenOnRailroadWithoutOwner() {
		var state = turnEndStateWithPlayers(playerOnRailroad());
		assertChoices(state, [Choices.buyProperty(Board.properties().readingRailroad), Choices.finishTurn()]);
	}
	
	function assertBuyPropertyChoiceWhenOnCompanyWithoutOwner() {
		var state = turnEndStateWithPlayers(playerOnCompany());
		assertChoices(state, [Choices.buyProperty(Board.properties().electricCompany), Choices.finishTurn()]);
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
	
	function assertNoPayTaxChoiceWhenAlreadyPaidTax() {
		var state = turnEndStateWithPlayers(playerOnLuxuryTax(), true);
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
	
	function assertRentToPayIsEstateRentWhenOwnerDoesNotOwnGroup() {
		assertRentIsMediterraneanAvenueRent();
		assertRentIsBroadwalkRent();
	}
	
	function assertRentIsMediterraneanAvenueRent() {
		var state = turnEndStateWithPlayers(playerOnEstateOwnedByOther(Board.properties().mediterranean));
		var secondPlayer = testData.players()[1];
				
		assertChoices(state, [Choices.payRent(2, secondPlayer)]);
	}
	
	function assertRentIsBroadwalkRent() {
		var state = turnEndStateWithPlayers(playerOnEstateOwnedByOther(Board.properties().broadwalk, 39));
		var secondPlayer = testData.players()[1];
				
		assertChoices(state, [Choices.payRent(50, secondPlayer)]);
	}
	
	function assertRentToPayIsDoubleTheEstateRentWhenOwnerOwnsGroup() {
		assertRentIsDoubleMediterraneanAvenueRent();
		assertRentIsDoubleBroadwalkRent();
	}
	
	function assertRentIsDoubleMediterraneanAvenueRent() {
		var state = turnEndStateWithPlayers(playerOnMediterraneanAvenueAndGroupOwned());
		var secondPlayer = testData.players()[1];
				
		assertChoices(state, [Choices.payRent(4, secondPlayer)]);
	}
	
	function assertRentIsDoubleBroadwalkRent() {
		var state = turnEndStateWithPlayers(playerOnBroadwalkAndGroupOwned());
		var secondPlayer = testData.players()[1];
				
		assertChoices(state, [Choices.payRent(100, secondPlayer)]);
	}
	
	function assertChoices(state, choices) {
		expect(state.choices().length).to.eql(choices.length);
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
		return [players[0].move([0, 1]), players[1], players[2]];
	}
	
	function playerOnRailroad() {
		var players = testData.players();
		return [players[0].move([0, 5]), players[1], players[2]];
	}
	
	function playerOnCompany() {
		var players = testData.players();
		return [players[0].move([0, 12]), players[1], players[2]];
	}
	
	function playerOnOwnedEstate() {
		var players = testData.players();
		return [
			players[0].move([0, 1]).buyProperty(Board.properties().mediterranean),
			players[1], players[2]
		];
	}
	
	function playerBrokeOnEstate() {
		var players = testData.players();
		return [players[0].pay(players[0].money() - 1).move([0, 1]), players[1], players[2]];
	}
	
	function playerOnEstateOwnedByOther(property, squareIndex) {
		var players = testData.players();
		return [
			players[0].move([0, squareIndex || 1]),
			players[1].buyProperty(property || Board.properties().mediterranean),
			players[2]
		];
	}
	
	function playerOnMediterraneanAvenueAndGroupOwned() {
		var players = testData.players();
		return [
			players[0].move([0, 1]),
			players[1].buyProperty(Board.properties().mediterranean).buyProperty(Board.properties().baltic),
			players[2]
		];
	}
	
	function playerOnBroadwalkAndGroupOwned() {
		var players = testData.players();
		return [
			players[0].move([0, 39]),
			players[1].buyProperty(Board.properties().park).buyProperty(Board.properties().broadwalk),
			players[2]
		];
	}
	
	function playerOnRailroadOwnedByOtherWithOneRailroad() {
		var players = testData.players();
		var owner = players[1].buyProperty(Board.properties().readingRailroad);
		return [players[0].move([0, 5]), owner, players[2]];
	}
	
	function playerOnRailroadOwnedByOtherWithTwoRailroads() {
		var players = testData.players();
		var owner = players[1].buyProperty(Board.properties().readingRailroad)
			.buyProperty(Board.properties().pennsylvaniaRailroad);
		return [players[0].move([0, 5]), owner, players[2]];
	}
	
	function playerOnRailroadOwnedByOtherWithThreeRailroads() {
		var players = testData.players();
		var owner = players[1].buyProperty(Board.properties().readingRailroad)
			.buyProperty(Board.properties().pennsylvaniaRailroad)
			.buyProperty(Board.properties().boRailroad);
		return [players[0].move([0, 5]), owner, players[2]];
	}
	
	function playerOnRailroadOwnedByOtherWithFourRailroads() {
		var players = testData.players();
		var owner = players[1].buyProperty(Board.properties().readingRailroad)
			.buyProperty(Board.properties().pennsylvaniaRailroad)
			.buyProperty(Board.properties().boRailroad)
			.buyProperty(Board.properties().shortRailroad);
		return [players[0].move([0, 5]), owner, players[2]];
	}
	
	function playerOnCompanyOwnedByOther() {
		var players = testData.players();
		return [
			players[0].move([0, 12]),
			players[1].buyProperty(Board.properties().electricCompany),
			players[2]
		];
	}
	
	function playerWithAlmostNoMoneyOnEstateOwnedByOther() {
		var players = testData.players();
		return [
			players[0].move([0, 1]).pay(players[0].money() - 1),
			players[1].buyProperty(Board.properties().mediterranean),
			players[2]
		];
	}
	
	function playerWithAlmostNoMoneyOnRailroadOwnedByOther() {
		var players = testData.players();
		return [
			players[0].move([0, 5]).pay(players[0].money() - 1),
			players[1].buyProperty(Board.properties().readingRailroad),
			players[2]
		];
	}
	
	function playerWithAlmostNoMoneyOnCompanyOwnedByOther() {
		var players = testData.players();
		return [
			players[0].move([0, 12]).pay(players[0].money() - 1),
			players[1].buyProperty(Board.properties().electricCompany),
			players[2]
		];
	}
	
	function playerOnLuxuryTax() {
		var players = testData.players();
		return [
			players[0].move([0, 38]),
			players[1],
			players[2]
		];
	}
	
	function playerBrokeOnLuxuryTax() {
		var players = testData.players();
		return [
			players[0].move([0, 38]).pay(players[0].money() - 1),
			players[1],
			players[2]
		];
	}
	
	function turnStartState() {
		return GameState.turnStartState({
			squares: Board.squares(),
			players: testData.players(),
			currentPlayerIndex: 0
		});
	}
}());