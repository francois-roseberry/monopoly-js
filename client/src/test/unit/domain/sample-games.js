(function() {
	"use strict";
	
	var Board = require('./board');
	var GameState = require('./game-state');
	
	var testData = require('./test-data');
	
	exports.turnStart = function () {
		return GameState.turnStartState({
			squares: Board.squares(),
			players: testData.players(),
			currentPlayerIndex: 0
		});
	};
	
	exports.turnStartWithSomePropertiesOwned = function () {
		var players = testData.players();
		
		return GameState.turnStartState({
			squares: Board.squares(),
			players: [
				players[0].buyProperty(Board.properties().mediterranean),
				players[1].buyProperty(Board.properties().readingRailroad),
				players[2]
			],
			currentPlayerIndex: 0
		});
	};
	
	exports.turnEndStateWithPlayerOnBroadwalkAndGroupOwned = function () {
		var players = testData.players();
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [
				players[0].move([0, 39]),
				players[1].buyProperty(Board.properties().park).buyProperty(Board.properties().broadwalk),
				players[2]
			],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnEstate = function () {
		var players = testData.players();
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [players[0].move([0, 1]), players[1], players[2]],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnRailroad = function () {
		var players = testData.players();
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [players[0].move([0, 5]), players[1], players[2]],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnCompany = function () {
		var players = testData.players();
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [players[0].move([0, 12]), players[1], players[2]],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnOwnedEstate = function () {
		var players = testData.players();
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [
				players[0].move([0, 1]).buyProperty(Board.properties().mediterranean),
				players[1], players[2]
			],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerBrokeOnEstate = function () {
		var players = testData.players();
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [players[0].pay(players[0].money() - 1).move([0, 1]), players[1], players[2]],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnLuxuryTax = function (paid) {
		var players = testData.players();
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [
				players[0].move([0, 38]),
				players[1],
				players[2]
			],
			currentPlayerIndex: 0
		}, paid || false);
	};
	
	exports.playerBrokeOnLuxuryTax = function () {
		var players = testData.players();
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [
				players[0].move([0, 38]).pay(players[0].money() - 1),
				players[1],
				players[2]
			],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnIncomeTax = function (paid) {
		var players = testData.players();
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [
				players[0].move([0, 4]),
				players[1],
				players[2]
			],
			currentPlayerIndex: 0
		}, paid || false);
	};
	
	exports.playerBrokeOnIncomeTax = function () {
		var players = testData.players();
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [
				players[0].move([0, 4]).pay(players[0].money() - 1),
				players[1],
				players[2]
			],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerBrokeOnEstateOwnedByOther = function () {
		var players = testData.players();
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [
				players[0].move([0, 1]).pay(players[0].money() - 1),
				players[1].buyProperty(Board.properties().mediterranean),
				players[2]
			],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerBrokeOnRailroadOwnedByOther = function () {
		var players = testData.players();
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [
				players[0].move([0, 5]).pay(players[0].money() - 1),
				players[1].buyProperty(Board.properties().readingRailroad),
				players[2]
			],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerBrokeOnCompanyOwnedByOther = function () {
		var players = testData.players();
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [
				players[0].move([0, 12]).pay(players[0].money() - 1),
				players[1].buyProperty(Board.properties().electricCompany),
				players[2]
			],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnCompanyOwnedByOther = function (paid) {
		var players = testData.players();
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [
				players[0].move([0, 12]),
				players[1].buyProperty(Board.properties().electricCompany),
				players[2]
			],
			currentPlayerIndex: 0
		}, paid || false);
	};
	
	exports.playerOnCompanyOwnedByOtherWithAllCompanies = function (paid) {
		var players = testData.players();
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [
				players[0].move([0, 12]),
				players[1].buyProperty(Board.properties().electricCompany)
					.buyProperty(Board.properties().waterWorks),
				players[2]
			],
			currentPlayerIndex: 0
		}, paid || false);
	};
	
	exports.playerOnRailroadOwnedByOtherWithOneRailroad = function (paid) {
		var players = testData.players();
		var owner = players[1].buyProperty(Board.properties().readingRailroad);
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [players[0].move([0, 5]), owner, players[2]],
			currentPlayerIndex: 0
		}, paid || false);
	};
	
	exports.playerOnRailroadOwnedByOtherWithTwoRailroads = function () {
		var players = testData.players();
		var owner = players[1].buyProperty(Board.properties().readingRailroad)
			.buyProperty(Board.properties().pennsylvaniaRailroad);
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [players[0].move([0, 5]), owner, players[2]],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnRailroadOwnedByOtherWithThreeRailroads = function () {
		var players = testData.players();
		var owner = players[1].buyProperty(Board.properties().readingRailroad)
			.buyProperty(Board.properties().pennsylvaniaRailroad)
			.buyProperty(Board.properties().boRailroad);
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [players[0].move([0, 5]), owner, players[2]],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnRailroadOwnedByOtherWithFourRailroads = function () {
		var players = testData.players();
		var owner = players[1].buyProperty(Board.properties().readingRailroad)
			.buyProperty(Board.properties().pennsylvaniaRailroad)
			.buyProperty(Board.properties().boRailroad)
			.buyProperty(Board.properties().shortRailroad);
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [players[0].move([0, 5]), owner, players[2]],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnMediterraneanAvenueAndGroupOwned = function () {
		var players = testData.players();
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [
				players[0].move([0, 1]),
				players[1].buyProperty(Board.properties().mediterranean).buyProperty(Board.properties().baltic),
				players[2]
			],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnGoToJail = function () {
		var players = testData.players();
		
		return GameState.turnEndState({
			squares: Board.squares(),
			players: [
				players[0].move([0, 30]),
				players[1],
				players[2]
			],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.firstPlayerInJail = function () {
		var players = testData.players();
		
		return GameState.turnStartState({
			squares: Board.squares(),
			players: [
				players[0].jail(),
				players[1],
				players[2]
			],
			currentPlayerIndex: 0
		}, false);
	};
}());