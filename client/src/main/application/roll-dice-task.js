(function() {
	"use strict";
	
	exports.start = function () {
		return new RollDiceTask();
	};
	
	function RollDiceTask() {
		this._diceRolled = new Rx.BehaviorSubject([{}, {}]);
	}
	
	RollDiceTask.prototype.diceRolled = function () {
		return this._diceRolled.asObservable();
	};
}());