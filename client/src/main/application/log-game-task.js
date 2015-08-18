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
		onDiceRolled(playGameTask)
			.subscribe(function (dice) {
				messages.onNext(dice.player + ' rolled ' + diceMessage(dice));
			});
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
			player: state.players[state.currentPlayerIndex].name
		};
	}
	
	function diceMessage(dice) {
		if (dice.firstDie === dice.secondDie) {
			return 'a double of ' + dice.firstDie;
		}
		
		return 'a ' + dice.firstDie + ' and a ' + dice.secondDie;		
	}
	
	LogGameTask.prototype.messages = function () {
		return this._messages.asObservable();
	};
}());