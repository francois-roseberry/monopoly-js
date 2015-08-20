(function() {
	"use strict";
	
	exports.rollDice = function () {
		return {
			id: 'roll-dice',
			name: 'Lancer les dés',
			match: function (visitor) {
				visitor['roll-dice']();
			}
		};
	};
	
	exports.finishTurn = function () {
		return {
			id: 'finish-turn',
			name: 'Finir le tour',
			match: function (visitor) {
				visitor['finish-turn']();
			}
		};
	};
}());