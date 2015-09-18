(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	
	exports.newChoice = function() {
		return new RollDiceChoice();
	};
	
	function RollDiceChoice() {
		this.id = 'roll-dice';
		this.name = i18n.CHOICE_ROLL_DICE;
	}
	
	RollDiceChoice.prototype.equals = function (other) {
		return (other instanceof RollDiceChoice);
	};
	
	RollDiceChoice.prototype.match = function (visitor) {
		return visitor[this.id]();
	};
}());