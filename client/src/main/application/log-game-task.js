(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	var Messages = require('./messages');
	
	exports.start = function (playGameTask) {
		precondition(playGameTask, 'LogGameTask requires a PlayGameTask');
		
		return new LogGameTask(playGameTask);
	};
	
	function LogGameTask(playGameTask) {
		this._messages = new Rx.ReplaySubject(1);
		
		watchGame(this._messages, playGameTask);
	}
	
	function watchGame(messages, playGameTask) {
		onDiceRolled(playGameTask)
			.takeUntil(playGameTask.completed())
			.subscribe(function (dice) {
				messages.onNext(diceMessage(dice));
			});
	}
	
	function diceMessage(dice) {
		if (dice.firstDie === dice.secondDie) {
			return Messages.logDoubleDiceRoll(dice.player, dice.firstDie);
		}
		
		return Messages.logDiceRoll(dice.player, dice.firstDie, dice.secondDie);		
	}
	
	function onDiceRolled(playGameTask) {
		return playGameTask.rollDiceTaskCreated()
			.flatMap(function (task) {
				return task.diceRolled().last().withLatestFrom(
					playGameTask.gameState(),
					combineDiceAndState);
			});
	}
	
	function combineDiceAndState(dice, state) {
		return {
			firstDie : dice[0],
			secondDie: dice[1],
			player: state.players()[state.currentPlayerIndex()].name()
		};
	}
	
	LogGameTask.prototype.messages = function () {
		return this._messages.asObservable();
	};
}());