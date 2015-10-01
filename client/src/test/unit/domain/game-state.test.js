(function() {
	"use strict";
	
	var GameState = require('./game-state');
	var Board = require('./board');
	var Choices = require('./choices');
	
	var games = require('./sample-games');
	var testData = require('./test-data');
	
	describe('A turnStart state', function () {
		it('offers the roll-dice choice', function () {
			var state = games.turnStart();
			
			assertChoices(state, [Choices.rollDice()]);
		});
	});
	
	describe('A turnEnd state', function () {
		it('offers the finish-turn choice', function () {
			var state = turnEndStateWithPlayers(testData.players());
			
			assertChoices(state, [Choices.finishTurn()]);
		});
		
		describe('when current player is on a property', function () {
			it('if it is not owned, offers to buy it', function () {
				assertBuyPropertyChoiceWhenOnPropertyWithoutOwner();
			});
			
			it('if it is owned, does not offer to buy it', function () {
				assertNoBuyPropertyChoiceWhenOnPropertyWithOwner();
			});
			
			it('if it is not owned but too expensive, does not offer to buy it', function () {
				assertNoBuyPropertyChoiceWhenOnPropertyTooExpensive();
			});
		});
		
		describe('when current player is on property owned by other player, offers to pay the rent of ', function () {
			it('the estate rent if that property is an estate and owner does not own group', function () {
				assertRentToPayIsEstateRentWhenOwnerDoesNotOwnGroup();
			});
			
			it('double the estate rent if that property is an estate and owner owns group', function () {
				assertRentToPayIsDoubleTheEstateRentWhenOwnerOwnsGroup();
			});
			
			it('25$ if that property is a railroad and owner possess 1 railroad', function () {
				var state = games.playerOnRailroadOwnedByOtherWithOneRailroad();
				var secondPlayer = testData.players()[1];
				
				assertChoices(state, [Choices.payRent(25, secondPlayer)]);
			});
			
			it('50$ if that property is a railroad and owner possess 2 railroads', function () {
				var state = games.playerOnRailroadOwnedByOtherWithTwoRailroads();
				var secondPlayer = testData.players()[1];
				
				assertChoices(state, [Choices.payRent(50, secondPlayer)]);
			});
			
			it('100$ if that property is a railroad and owner possess 3 railroads', function () {
				var state = games.playerOnRailroadOwnedByOtherWithThreeRailroads();
				var secondPlayer = testData.players()[1];
				
				assertChoices(state, [Choices.payRent(100, secondPlayer)]);
			});
			
			it('200$ if that property is a railroad and owner possess 4 railroads', function () {
				var state = games.playerOnRailroadOwnedByOtherWithFourRailroads();
				var secondPlayer = testData.players()[1];
				
				assertChoices(state, [Choices.payRent(200, secondPlayer)]);
			});
			
			it('25$ if that property is a company', function () {
				var state = games.playerOnCompanyOwnedByOther();
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
		
		describe('when current player is on luxury-tax', function () {
			it('offers a 75$ tax', function () {
				var state = games.playerOnLuxuryTax();
				
				assertChoices(state, [Choices.payTax(75)]);
			});
			
			it('if he is broke on luxury-tax, offers bankruptcy', function () {
				var state = games.playerBrokeOnLuxuryTax();
				
				assertChoices(state, [Choices.goBankrupt()]);
			});
			
			it('if he already paid, does not offer to pay the tax again', function () {
				assertNoPayTaxChoiceWhenAlreadyPaidLuxuryTax();
			});
		});
		
		describe('when current player is on income-tax', function () {
			it('offers a $200 tax', function () {
				var state = games.playerOnIncomeTax();
				
				assertChoices(state, [Choices.payTax(200)]);
			});
			
			it('if he is broke, offers bankruptcy', function () {
				var state = games.playerBrokeOnIncomeTax();
				
				assertChoices(state, [Choices.goBankrupt()]);
			});
			
			it('if he already paid, does not offer to pay the tax again', function () {
				assertNoPayTaxChoiceWhenAlreadyPaidIncomeTax();
			});
		});
	});
	
	function assertNoBuyPropertyChoiceWhenOnPropertyTooExpensive() {
		var state = games.playerBrokeOnEstate();
		assertChoices(state, [Choices.finishTurn()]);
	}
	
	function assertNoBuyPropertyChoiceWhenOnPropertyWithOwner() {
		var state = games.playerOnOwnedEstate();
		assertChoices(state, [Choices.finishTurn()]);
	}
	
	function assertBuyPropertyChoiceWhenOnPropertyWithoutOwner() {
		assertBuyPropertyChoiceWhenOnEstateWithoutOwner();
		assertBuyPropertyChoiceWhenOnRailroadWithoutOwner();
		assertBuyPropertyChoiceWhenOnCompanyWithoutOwner();
	}
	
	function assertBuyPropertyChoiceWhenOnEstateWithoutOwner() {
		var state = games.playerOnEstate();
		assertChoices(state, [Choices.buyProperty(Board.properties().mediterranean), Choices.finishTurn()]);
	}
	
	function assertBuyPropertyChoiceWhenOnRailroadWithoutOwner() {
		var state = games.playerOnRailroad();
		assertChoices(state, [Choices.buyProperty(Board.properties().readingRailroad), Choices.finishTurn()]);
	}
	
	function assertBuyPropertyChoiceWhenOnCompanyWithoutOwner() {
		var state = games.playerOnCompany();
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
		var state = games.playerOnRailroadOwnedByOtherWithOneRailroad(true);
		assertChoices(state, [Choices.finishTurn()]);
	}
	
	function assertNoPayRentChoiceWhenAlreadyPaidCompanyRent() {
		var state = games.playerOnCompanyOwnedByOther(true);
		assertChoices(state, [Choices.finishTurn()]);
	}
	
	function assertNoPayTaxChoiceWhenAlreadyPaidLuxuryTax() {
		var state = games.playerOnLuxuryTax(true);
		assertChoices(state, [Choices.finishTurn()]);
	}
	
	function assertNoPayTaxChoiceWhenAlreadyPaidIncomeTax() {
		var state = games.playerOnIncomeTax(true);
		assertChoices(state, [Choices.finishTurn()]);
	}
	
	function assertBankruptcyChoiceWhenPropertyRentIsTooHigh() {
		assertBankruptcyChoiceWhenEstateRentIsTooHigh();
		assertBankruptcyChoiceWhenRailroadRentIsTooHigh();
		assertBankruptcyChoiceWhenCompanyRentIsTooHigh();
	}
	
	function assertBankruptcyChoiceWhenEstateRentIsTooHigh() {
		var state = games.playerBrokeOnEstateOwnedByOther();
		assertChoices(state, [Choices.goBankrupt()]);
	}
	
	function assertBankruptcyChoiceWhenRailroadRentIsTooHigh() {
		var state = games.playerBrokeOnRailroadOwnedByOther();
		assertChoices(state, [Choices.goBankrupt()]);
	}
	
	function assertBankruptcyChoiceWhenCompanyRentIsTooHigh() {
		var state = games.playerBrokeOnCompanyOwnedByOther();
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
		var state = games.playerOnMediterraneanAvenueAndGroupOwned();
		var secondPlayer = testData.players()[1];
				
		assertChoices(state, [Choices.payRent(4, secondPlayer)]);
	}
	
	function assertRentIsDoubleBroadwalkRent() {
		var state = games.turnEndStateWithPlayerOnBroadwalkAndGroupOwned();
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
	
	function playerOnEstateOwnedByOther(property, squareIndex) {
		var players = testData.players();
		return [
			players[0].move([0, squareIndex || 1]),
			players[1].buyProperty(property || Board.properties().mediterranean),
			players[2]
		];
	}
}());