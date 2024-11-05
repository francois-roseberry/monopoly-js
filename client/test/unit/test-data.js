(function() {
	"use strict";
	
	var Board = require('./board');
	var Player = require('./player');
	
	exports.playersConfiguration = function () {
		return [
			{ type: 'human' },
			{ type: 'computer' }, 
			{ type: 'computer' }
		];
	};
	
	exports.players = function () {
		var board = Board.standard();
		return Player.newPlayers(
			exports.playersConfiguration(),
			board.playerParameters());
	};
	
	exports.gameConfiguration = function () {
		return {
			board: Board.standard(),
			players: exports.playersConfiguration(),
			options: { fastDice: true }
		};
	};
}());