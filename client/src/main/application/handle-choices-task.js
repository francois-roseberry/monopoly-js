(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.start = function (playGameTask) {
		precondition(playGameTask, 'HandleChoicesTask requires a PlayGameTask');
		
		var humanChoices = choicesForPlayerType(playGameTask, 'human');
		
		var task = new HandleChoicesTask(humanChoices);
		
		choicesForPlayerType(playGameTask, 'computer')
			.subscribe(computerPlayer(task));
			
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
		this._choiceMade.onNext(choice);
	};
	
	function choicesForPlayerType(playGameTask, type) {
		return playGameTask._choices.withLatestFrom(
			playGameTask._gameState,
			function (choices, state) {
				return {
					choices: choices,
					playerType: state.players[state.currentPlayerIndex].type
				};
			})
			.filter(function (choicesAndPlayerType) {
				return choicesAndPlayerType.playerType === type;
			})
			.map(function (choicesAndPlayerType) {
				return choicesAndPlayerType.choices;
			})
			.takeUntil(playGameTask.completed());
	}
	
	function computerPlayer(self) {
		return function (choices) {
			if (choices.length > 0) {
				Rx.Observable.timer(0).subscribe(function () {
					self.makeChoice(choices[0]);
				});
			}
		};
	}
}());