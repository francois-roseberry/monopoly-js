(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	
	exports.newChoice = function() {
		return new FinishTurnChoice();
	};
	
	function FinishTurnChoice() {
		this.id = 'finish-turn';
		this.name = i18n.CHOICE_FINISH_TURN;
	}
	
	FinishTurnChoice.prototype.equals = function (other) {
		return (other instanceof FinishTurnChoice);
	};
	
	FinishTurnChoice.prototype.match = function (visitor) {
		return visitor[this.id]();
	};
}());