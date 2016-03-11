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
		return Player.newPlayers(exports.playersConfiguration(), Board.standard().startMoney());
	};
	
	exports.gameConfiguration = function () {
		return {
			board: Board.standard(),
			players: exports.playersConfiguration(),
			options: { fastDice: true }
		};
	};
}());