(function() {
	"use strict";
	
	var Board = require('./board');
	var GameState = require('./game-state');
	
	var testData = require('./test-data');
	
	exports.turnStart = function () {
		return GameState.turnStartState({
			board: Board.standard(),
			players: testData.players(),
			currentPlayerIndex: 0
		});
	};
	
	exports.turnStartWithSomePropertiesOwned = function () {
		var board = Board.standard();
		var players = testData.players();
		
		return GameState.turnStartState({
			board: board,
			players: [
				players[0].buyProperty(board.properties().mediterranean),
				players[1].buyProperty(board.properties().readingRailroad),
				players[2]
			],
			currentPlayerIndex: 0
		});
	};
	
	exports.turnEndStateWithPlayerOnBroadwalkAndGroupOwned = function () {
		var board = Board.standard();
		var players = testData.players();
		
		return GameState.turnEndState({
			board: board,
			players: [
				players[0].move([0, 39]),
				players[1].buyProperty(board.properties().park).buyProperty(board.properties().broadwalk),
				players[2]
			],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnEstate = function () {
		var players = testData.players();
		
		return GameState.turnEndState({
			board: Board.standard(),
			players: [players[0].move([0, 1]), players[1], players[2]],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnRailroad = function () {
		var players = testData.players();
		
		return GameState.turnEndState({
			board: Board.standard(),
			players: [players[0].move([0, 5]), players[1], players[2]],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnCompany = function () {
		var players = testData.players();
		
		return GameState.turnEndState({
			board: Board.standard(),
			players: [players[0].move([0, 12]), players[1], players[2]],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnOwnedEstate = function () {
		var board = Board.standard();
		var players = testData.players();
		
		return GameState.turnEndState({
			board: board,
			players: [
				players[0].move([0, 1]).buyProperty(board.properties().mediterranean),
				players[1], players[2]
			],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerBrokeOnEstate = function () {
		var players = testData.players();
		
		return GameState.turnEndState({
			board: Board.standard(),
			players: [players[0].pay(players[0].money() - 1).move([0, 1]), players[1], players[2]],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnLuxuryTax = function (paid) {
		var players = testData.players();
		
		return GameState.turnEndState({
			board: Board.standard(),
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
			board: Board.standard(),
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
			board: Board.standard(),
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
			board: Board.standard(),
			players: [
				players[0].move([0, 4]).pay(players[0].money() - 1),
				players[1],
				players[2]
			],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerBrokeOnEstateOwnedByOther = function () {
		var board = Board.standard();
		var players = testData.players();
		
		return GameState.turnEndState({
			board: board,
			players: [
				players[0].move([0, 1]).pay(players[0].money() - 1),
				players[1].buyProperty(board.properties().mediterranean),
				players[2]
			],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerBrokeOnRailroadOwnedByOther = function () {
		var board = Board.standard();
		var players = testData.players();
		
		return GameState.turnEndState({
			board: board,
			players: [
				players[0].move([0, 5]).pay(players[0].money() - 1),
				players[1].buyProperty(board.properties().readingRailroad),
				players[2]
			],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerBrokeOnCompanyOwnedByOther = function () {
		var board = Board.standard();
		var players = testData.players();
		
		return GameState.turnEndState({
			board: board,
			players: [
				players[0].move([0, 12]).pay(players[0].money() - 1),
				players[1].buyProperty(board.properties().electricCompany),
				players[2]
			],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnCompanyOwnedByOther = function (paid) {
		var board = Board.standard();
		var players = testData.players();
		
		return GameState.turnEndState({
			board: board,
			players: [
				players[0].move([0, 12]),
				players[1].buyProperty(board.properties().electricCompany),
				players[2]
			],
			currentPlayerIndex: 0
		}, paid || false);
	};
	
	exports.playerOnCompanyOwnedByOtherWithAllCompanies = function (paid) {
		var board = Board.standard();
		var players = testData.players();
		
		return GameState.turnEndState({
			board: board,
			players: [
				players[0].move([0, 12]),
				players[1].buyProperty(board.properties().electricCompany)
					.buyProperty(board.properties().waterWorks),
				players[2]
			],
			currentPlayerIndex: 0
		}, paid || false);
	};
	
	exports.playerOnRailroadOwnedByOtherWithOneRailroad = function (paid) {
		var board = Board.standard();
		var players = testData.players();
		var owner = players[1].buyProperty(board.properties().readingRailroad);
		
		return GameState.turnEndState({
			board: board,
			players: [players[0].move([0, 5]), owner, players[2]],
			currentPlayerIndex: 0
		}, paid || false);
	};
	
	exports.playerOnRailroadOwnedByOtherWithTwoRailroads = function () {
		var board = Board.standard();
		var players = testData.players();
		var owner = players[1].buyProperty(board.properties().readingRailroad)
			.buyProperty(board.properties().pennsylvaniaRailroad);
		
		return GameState.turnEndState({
			board: board,
			players: [players[0].move([0, 5]), owner, players[2]],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnRailroadOwnedByOtherWithThreeRailroads = function () {
		var board = Board.standard();
		var players = testData.players();
		var owner = players[1].buyProperty(board.properties().readingRailroad)
			.buyProperty(board.properties().pennsylvaniaRailroad)
			.buyProperty(board.properties().boRailroad);
		
		return GameState.turnEndState({
			board: board,
			players: [players[0].move([0, 5]), owner, players[2]],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnRailroadOwnedByOtherWithFourRailroads = function () {
		var board = Board.standard();
		var players = testData.players();
		var owner = players[1].buyProperty(board.properties().readingRailroad)
			.buyProperty(board.properties().pennsylvaniaRailroad)
			.buyProperty(board.properties().boRailroad)
			.buyProperty(board.properties().shortRailroad);
		
		return GameState.turnEndState({
			board: board,
			players: [players[0].move([0, 5]), owner, players[2]],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnMediterraneanAvenueAndGroupOwned = function () {
		var board = Board.standard();
		var players = testData.players();
		
		return GameState.turnEndState({
			board: board,
			players: [
				players[0].move([0, 1]),
				players[1].buyProperty(board.properties().mediterranean).buyProperty(board.properties().baltic),
				players[2]
			],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.playerOnGoToJail = function () {
		var players = testData.players();
		
		return GameState.turnEndState({
			board: Board.standard(),
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
			board: Board.standard(),
			players: [
				players[0].jail(),
				players[1],
				players[2]
			],
			currentPlayerIndex: 0
		}, false);
	};
	
	exports.firstPlayerBrokeInJail = function () {
		var players = testData.players();
		
		return GameState.turnStartState({
			board: Board.standard(),
			players: [
				players[0].pay(players[0].money() - 1).jail(),
				players[1],
				players[2]
			],
			currentPlayerIndex: 0
		}, false);
	};
}());