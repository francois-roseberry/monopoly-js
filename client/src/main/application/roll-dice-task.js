(function() {
	"use strict";
	
	exports.start = function () {
		return new RollDiceTask();
	};
	
	function RollDiceTask() {
		this._diceRolled = new Rx.BehaviorSubject([rollDie(), rollDie()]);
		
		rollDice(this._diceRolled);
	}
	
	function rollDice(diceRolled) {
		Rx.Observable.timer(0, 100)
			.take(15)
			.subscribe(function () {
				diceRolled.onNext([rollDie(), rollDie()]);
			});
	}

	
	function rollDie() {
		return Math.floor((Math.random() * 6) + 1);
	}
	
	RollDiceTask.prototype.diceRolled = function () {
		return this._diceRolled.asObservable();
	};
}());