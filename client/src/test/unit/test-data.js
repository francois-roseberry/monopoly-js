(function() {
	"use strict";
	
	var Board = require('./board');
	
	exports.players = function () {
		return [
			{ type: 'human' },
			{ type: 'computer' }, 
			{ type: 'computer' }
		];
	};
	
	exports.gameConfiguration = function () {
		return {
			squares: Board.squares(),
			players: exports.players(),
			options: { fastDice: true }
		};
	};
}());