(function() {
	"use strict";
	
	exports.start = function (options) {
		return new RollDiceTask(options && options.fast || false);
	};
	
	function RollDiceTask(fastOption) {
		this._diceRolled = new Rx.BehaviorSubject([rollDie(), rollDie()]);
		
		rollDice(fastOption, this._diceRolled);
	}
	
	function rollDice(fastOption, diceRolled) {
		Rx.Observable.interval(100)
			.take(fastOption ? 1 : 15)
			.subscribe(function () {
				diceRolled.onNext([rollDie(), rollDie()]);
			}, _.noop, function () {
				diceRolled.onCompleted();
			});
	}

	
	function rollDie() {
		return Math.floor((Math.random() * 6) + 1);
	}
	
	RollDiceTask.prototype.diceRolled = function () {
		return this._diceRolled.asObservable();
	};
}());