(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.start = function (playGameTask) {
		precondition(playGameTask, 'HandleChoicesTask requires a PlayGameTask');
		
		var humanChoices = new Rx.ReplaySubject(1);
		choicesForPlayerType(playGameTask, 'human')
			.subscribe(humanChoices);
		
		var task = new HandleChoicesTask(humanChoices);
		
		choicesForPlayerType(playGameTask, 'computer')
			.map(computerPlayer)
			.subscribe(applyChoice(task));
			
		return task;
	};
	
	function HandleChoicesTask(humanChoices) {
		this._humanChoices = humanChoices;
		this._choiceMade = new Rx.Subject();
	}
	
	HandleChoicesTask.prototype.choices = function () {
		return this._humanChoices.asObservable();
	};
	
	HandleChoicesTask.prototype.choiceMade = function () {
		return this._choiceMade.asObservable();
	};
	
	HandleChoicesTask.prototype.makeChoice = function (choice) {
		this._humanChoices.onNext([]);
		this._choiceMade.onNext(choice);
	};
	
	function choicesForPlayerType(playGameTask, type) {
		return playGameTask.gameState()
			.filter(function (state) {
				return state.players()[state.currentPlayerIndex()].type() === type;
			})
			.map(function (state) {
				return state.choices();
			})
			.takeUntil(playGameTask.completed());
	}
	
	function computerPlayer(choices) {
		return choices[0];
	}
	
	function applyChoice(task) {
		return function (choice) {
			Rx.Observable.timer(0).subscribe(function () {
				task._choiceMade.onNext(choice);
			});
		};
	}
}());