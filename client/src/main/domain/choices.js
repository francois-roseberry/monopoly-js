(function() {
	"use strict";
	
	exports.rollDice = function () {
		return {
			id: 'roll-dice',
			name: 'Roll the dice',
			match: function (visitor) {
				visitor['roll-dice']();
			}
		};
	};
	
	exports.finishTurn = function () {
		return {
			id: 'finish-turn',
			name: 'Finish this turn',
			match: function (visitor) {
				visitor['finish-turn']();
			}
		};
	};
}());