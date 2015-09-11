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
		return combineWithPrevious(playGameTask.gameState()
			.distinctUntilChanged(function (state) {
				return _.reduce(state.players(), function (sum, player) {
					return player.properties().length + sum;
				}, 0);
			}))
			.map(function (states) {
				var player = states.previous.players()[states.current.currentPlayerIndex()];
				var newProperty = findNewProperty(states);	
				var propertyName = nameOfProperty(newProperty);
				
				return {
					player: player.name(),
					property: propertyName
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
					fromPlayer: fromPlayer.name(),
					toPlayer: toPlayer.name(),
					amount: amount
				};
			});
	}
	
	function findNewProperty(states) {
		var previousProperties = states.previous.players()[states.current.currentPlayerIndex()].properties();
		var currentProperties = states.current.players()[states.current.currentPlayerIndex()].properties();
		
		var newPropertyId = _.filter(currentProperties, function (id) {
			return !_.contains(previousProperties, id);
		})[0];
		return states.current.propertyById(newPropertyId);
	}
	
	function nameOfProperty(property) {
		return property.match({
			'estate': function (id, name) { return name; },
			'railroad': function (id, name) { return name; },
			'company': function (id, name) { return name; }
		});
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
			player: state.players()[state.currentPlayerIndex()].name()
		};
	}
	
	LogGameTask.prototype.messages = function () {
		return this._messages.asObservable();
	};
}());