(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.start = function (playGameTask) {
		precondition(playGameTask, 'HandleChoicesTask requires a PlayGameTask');
		
		var humanChoices = new Rx.ReplaySubject(1);
		var completed = new Rx.AsyncSubject();
		gameStateForPlayerType(playGameTask, 'human', completed)
			.map(function (state) {
				return state.choices();
			})
			.subscribe(humanChoices);
		
		var task = new HandleChoicesTask(humanChoices, completed);
		
		gameStateForPlayerType(playGameTask, 'computer', completed)
			.filter(function (state) {
				return state.choices().length > 0;
			})
			.map(computerPlayer)
			.subscribe(applyChoice(task));
			
		return task;
	};
	
	function HandleChoicesTask(humanChoices, completed) {
		this._humanChoices = humanChoices;
		this._choiceMade = new Rx.Subject();
		this._completed = completed;
	}
	
	HandleChoicesTask.prototype.stop = function () {
		this._completed.onNext(true);
		this._completed.onCompleted();
	};
	
	HandleChoicesTask.prototype.choices = function () {
		return this._humanChoices.takeUntil(this._completed);
	};
	
	HandleChoicesTask.prototype.choiceMade = function () {
		return this._choiceMade.takeUntil(this._completed);
	};
	
	HandleChoicesTask.prototype.completed = function () {
		return this._completed.asObservable();
	};
	
	HandleChoicesTask.prototype.makeChoice = function (choice, arg) {
		this._humanChoices.onNext([]);
		this._choiceMade.onNext({choice: choice, arg: arg});
	};
	
	function gameStateForPlayerType(playGameTask, type, completed) {
		return playGameTask.gameState()
			.takeUntil(completed)
			.filter(function (state) {
				return state.currentPlayer().type() === type;
			});
	}
	
	function computerPlayer(state) {
		if (_.isFunction(state.offer)) {
			var valueForCurrentPlayer = calculateOfferValueFor(state.offer(), 0);
			var valueForOtherPlayer = calculateOfferValueFor(state.offer(), 1);
			
			if (valueForCurrentPlayer >= valueForOtherPlayer) {
				return state.choices()[0];
			}
			
			return state.choices()[1];
		}
		
		return state.choices()[0];
	}
	
	function calculateOfferValueFor(offer, playerIndex) {
		return _.reduce(offer.propertiesFor(playerIndex), function (totalValue, property) {
			return totalValue + property.price();
		}, offer.moneyFor(playerIndex));
	}
	
	function applyChoice(task) {
		return function (choice) {
			Rx.Observable.timer(0).subscribe(function () {
				task._choiceMade.onNext({choice: choice});
			});
		};
	}
}());