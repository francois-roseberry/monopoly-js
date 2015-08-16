(function() {
	"use strict";
	
	exports.rollDice = function () {
		return {
			id: 'roll-dice',
			name: 'Roll the dice'
		};
	};
	
	exports.finishTurn = function () {
		return {
			id: 'finish-turn',
			name: 'Finish this turn'
		};
	};
}());