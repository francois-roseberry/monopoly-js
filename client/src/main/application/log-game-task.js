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
			
		onPropertyBought(playGameTask)
			.takeUntil(playGameTask.completed())
			.subscribe(function (info) {
				messages.onNext(Messages.logPropertyBought(info.player, info.property));
			});
			
		onRentPaid(playGameTask)
			.takeUntil(playGameTask.completed())
			.subscribe(function (info) {
				messages.onNext(Messages.logRentPaid(info.amount, info.fromPlayer, info.toPlayer));
			});
			
		onSalaryEarned(playGameTask)
			.takeUntil(playGameTask.completed())
			.subscribe(function (player) {
				messages.onNext(Messages.logSalaryReceived(player));
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
	
	function onPropertyBought(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
			.filter(function (states) {
				return _.some(states.current.players(), function (player, index) {
					var currentProperties = player.properties();
					var previousProperties = states.previous.players()[index].properties();
					
					return currentProperties.length > previousProperties.length;
				});
			})
			.map(function (states) {
				var player = states.previous.players()[states.current.currentPlayerIndex()];
				var newProperty = findNewProperty(states);
				
				return {
					player: player,
					property: newProperty
				};
			});
	}
	
	function onRentPaid(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
			.filter(function (states) {
				var fromPlayer = _.find(states.current.players(), function (player, index) {
					return player.money() < states.previous.players()[index].money();
				});
				var toPlayer = _.find(states.current.players(), function (player, index) {
					return player.money() > states.previous.players()[index].money();
				});
				
				return !!fromPlayer && !!toPlayer;
			})
			.map(function (states) {
				var fromPlayer = _.find(states.current.players(), function (player, index) {
					return player.money() < states.previous.players()[index].money();
				});
				var toPlayer = _.find(states.current.players(), function (player, index) {
					return player.money() > states.previous.players()[index].money();
				});
				
				var amount = states.previous.players()[states.current.currentPlayerIndex()].money() -
					states.current.players()[states.current.currentPlayerIndex()].money();
				
				return {
					fromPlayer: fromPlayer,
					toPlayer: toPlayer,
					amount: amount
				};
			});
	}
	
	function onSalaryEarned(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
		.filter(function (states) {
			var currentPlayer = states.current.players()[states.current.currentPlayerIndex()];
			var previousPlayer = states.previous.players()[states.current.currentPlayerIndex()];
			
			return currentPlayer.money() === (previousPlayer.money() + 200);
		})
		.map(function (states) {
			return states.current.players()[states.current.currentPlayerIndex()];
		});
	}
	
	function findNewProperty(states) {
		var previousProperties = states.previous.players()[states.current.currentPlayerIndex()].properties();
		var currentProperties = states.current.players()[states.current.currentPlayerIndex()].properties();
		
		var newProperty = _.filter(currentProperties, function (property) {
			return !_.contains(_.map(previousProperties, function (property) { return property.id(); }), property.id());
		})[0];
		return newProperty;
	}
	
	function combineWithPrevious(observable) {
		var previous;
		var subject = new Rx.Subject();
		observable.subscribe(function (current) {
			if (previous) {
				subject.onNext({
					previous: previous,
					current: current
				});
			}
			previous = current;
		}, subject, subject);
		
		return subject.asObservable();
	}
	
	function combineDiceAndState(dice, state) {
		return {
			firstDie : dice[0],
			secondDie: dice[1],
			player: state.players()[state.currentPlayerIndex()]
		};
	}
	
	LogGameTask.prototype.messages = function () {
		return this._messages.asObservable();
	};
}());