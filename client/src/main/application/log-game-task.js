(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.start = function (playGameTask) {
		precondition(playGameTask, 'LogGameTask requires a PlayGameTask');
		
		return new LogGameTask(playGameTask);
	};
	
	function LogGameTask(playGameTask) {
		this._messages = new Rx.ReplaySubject(1);
		
		watchGame(this._messages, playGameTask);
	}
	
	function watchGame(messages, playGameTask) {
		playGameTask.rollDiceTaskCreated().subscribe(function (task) {
			task.diceRolled().last().withLatestFrom(
				playGameTask.gameState(),
				function (dice, state) {
					return {
						firstDie : dice[0],
						secondDie: dice[1],
						player: state.players[state.currentPlayerIndex].name
					};
				})
				.subscribe(function (dice) {
					messages.onNext(dice.player + ' rolled a ' + dice.firstDie + ' and a ' + dice.secondDie);
				});
		});
	}
	
	LogGameTask.prototype.messages = function () {
		return this._messages.asObservable();
	};
}());