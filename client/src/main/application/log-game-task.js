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
			
		onTaxPaid(playGameTask)
			.takeUntil(playGameTask.completed())
			.subscribe(function (info) {
				messages.onNext(Messages.logTaxPaid(info.amount, info.player));
			});
			
		onOfferMade(playGameTask)
			.takeUntil(playGameTask.completed())
			.subscribe(function (info) {
				messages.onNext(Messages.logOfferMade(info.player1, info.player2, info.offer));
			});
			
		onOfferRejected(playGameTask)
			.takeUntil(playGameTask.completed())
			.subscribe(function () {
				messages.onNext(Messages.logOfferRejected());
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
	
	function onOfferMade(playGameTask) {
		return playGameTask.gameState()
			.filter(function (state) {
				return _.isFunction(state.offer);
			})
			.map(function (state) {
				var currentPlayerIndex = _.findIndex(state.players(), function (player) {
					return player.id() === state.offer().currentPlayerId();
				});
				var otherPlayerIndex = _.findIndex(state.players(), function (player) {
					return player.id() === state.offer().otherPlayerId();
				});
				
				var currentPlayerName = state.players()[currentPlayerIndex].name();
				var otherPlayerName = state.players()[otherPlayerIndex].name();
				
				return {
					player1: currentPlayerName,
					player2: otherPlayerName,
					offer: state.offer()
				};
			});
	}
	
	function onOfferRejected(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
			.filter(function (states) {
				return _.isFunction(states.previous.offer) && !states.current.offer;
			});
	}
	
	function onTaxPaid(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
			.filter(function (states) {
				var playerWhoPaid = _.find(states.current.players(), function (player, index) {
					return player.money() < states.previous.players()[index].money();
				});
				
				if (playerWhoPaid) {
					var onlyOnePlayerMoneyChanged = _.every(states.current.players(), function (player, index) {
						if (player.id() === playerWhoPaid.id()) {
							return true;
						}
						
						return player.money() === states.previous.players()[index].money();
					});
					
					var noPropertyChanged = _.every(states.current.players(), function (player, index) {
						return player.properties().length === states.previous.players()[index].properties().length;
					});
					
					return onlyOnePlayerMoneyChanged && noPropertyChanged;
				}
				
				return false;
			})
			.map(function (states) {
				var playerWhoPaid = _.find(states.current.players(), function (player, index) {
					return player.money() < states.previous.players()[index].money();
				});
				
				var amount = states.previous.players()[states.current.currentPlayerIndex()].money() -
					playerWhoPaid.money();
				
				return {
					player: playerWhoPaid,
					amount: amount
				};
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