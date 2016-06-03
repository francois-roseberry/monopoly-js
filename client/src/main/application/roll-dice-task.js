(function() {
	"use strict";
	
	exports.start = function (options) {
		return new RollDiceTask(
			options && options.fast || false,
			options && options.dieFunction || rollDie);
	};
	
	function RollDiceTask(fastOption, dieFunction) {
		this._diceRolled = new Rx.BehaviorSubject([dieFunction(), dieFunction()]);
		
		rollDice(fastOption, dieFunction, this._diceRolled);
	}
	
	function rollDice(fastOption, dieFunction, diceRolled) {
		Rx.Observable.interval(100)
			.take(fastOption ? 1 : 15)
			.map(function () {
				return [dieFunction(), dieFunction()];
			})
			.subscribe(diceRolled);
	}
	
	function rollDie() {
		return Math.floor((Math.random() * 6) + 1);
	}
	
	RollDiceTask.prototype.diceRolled = function () {
		return this._diceRolled.asObservable();
	};
}());