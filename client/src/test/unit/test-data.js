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
		return Player.newPlayers(exports.playersConfiguration());
	};
	
	exports.gameConfiguration = function () {
		return {
			squares: Board.squares(),
			players: exports.playersConfiguration(),
			options: { fastDice: true }
		};
	};
}());