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
			task.diceRolled().last().subscribe(function (dice) {
				messages.onNext('Player rolled a ' + dice[0] + ' and a ' + dice[1]);
			});
		});
	}
	
	LogGameTask.prototype.messages = function () {
		return this._messages.asObservable();
	};
}());