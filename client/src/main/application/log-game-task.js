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
		Rx.Observable.merge(
			onDiceRolled(playGameTask),
			onPropertyBought(playGameTask),
			onRentPaid(playGameTask),
			onSalaryEarned(playGameTask),
			onTaxPaid(playGameTask),
			onOfferMade(playGameTask),
			onOfferAcceptedOrRejected(playGameTask),
			onPlayerJailed(playGameTask),
			onPlayerGoneBankrupt(playGameTask),
			onGameWon(playGameTask)
		)
		.takeUntil(playGameTask.completed())
		.subscribe(messages);
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
			})
			.map(function (dice) {
				return diceMessage(dice);
			});
	}
	
	function onPropertyBought(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
			.filter(function (states) {
				if (_.isFunction(states.previous.offer)) {
					return false;
				}
				
				return _.some(states.current.players(), function (player, index) {
					var currentProperties = player.properties();
					var previousProperties = states.previous.players()[index].properties();
					
					return currentProperties.length > previousProperties.length;
				});
			})
			.map(function (states) {
				var player = states.previous.players()[states.current.currentPlayerIndex()];
				var newProperty = findNewProperty(states);
				
				return Messages.logPropertyBought(player, newProperty);
			});
	}
	
	function onRentPaid(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
			.filter(function (states) {
				if (_.isFunction(states.previous.offer)) {
					return false;
				}
				
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
				
				return Messages.logRentPaid(amount, fromPlayer, toPlayer);
			});
	}
	
	function onSalaryEarned(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
			.filter(function (states) {
				return _.reduce(states.current.players(), function (memo, player, index) {
					var previousPlayer = states.previous.players()[index];
					
					if (index === states.current.currentPlayerIndex()) {
						return memo && (player.money() === previousPlayer.money() + 200);
					}
					
					return memo && (player.money() === previousPlayer.money());					
				}, true);
			})
			.map(function (states) {
				var player = states.current.players()[states.current.currentPlayerIndex()];
				
				return Messages.logSalaryReceived(player);
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
				
				var currentPlayer = state.players()[currentPlayerIndex];
				var otherPlayer = state.players()[otherPlayerIndex];
				
				return Messages.logOfferMade(currentPlayer, otherPlayer, state.offer());
			});
	}
	
	function onOfferAcceptedOrRejected(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
			.filter(function (states) {
				return _.isFunction(states.previous.offer) && !states.current.offer;
			})
			.map(function (states) {
				var somePlayerHasChanged =_.some(states.previous.players(), function (player, index) {
					if (player.money() !== states.current.players()[index].money()) {
						return true;
					}
					
					if (!sameProperties(player.properties(), states.current.players()[index].properties())) {
						return true;
					}
					
					
					return false;
				});
				
				if (somePlayerHasChanged) {
					return Messages.logOfferAccepted();
				}
				
				return Messages.logOfferRejected();
			});
	}
	
	function sameProperties(left, right) {
		if (left.length !== right.length) {
			return false;
		}
		
		return _.every(left, function (property, index) {
			return property.id() === right[index].id();
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
				
				return Messages.logTaxPaid(amount, playerWhoPaid);
			});
	}
	
	function onPlayerJailed(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
			.filter(function (states) {
				return !states.previous.players()[states.current.currentPlayerIndex()].jailed() &&
					states.current.players()[states.current.currentPlayerIndex()].jailed();
			})
			.map(function (states) {
				var currentPlayer = states.current.players()[states.current.currentPlayerIndex()];
				
				return Messages.logGoneToJail(currentPlayer);
			});
	}
	
	function onPlayerGoneBankrupt(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
			.filter(function (states) {
				return states.previous.players().length !== states.current.players().length;
			})
			.map(function (states) {
				var playerGoneBankrupt = _.find(states.previous.players(), function (player, index) {
					return states.current.players().length <= index ||
						player.id() !== states.current.players()[index].id();
				});
				
				
				return Messages.logGoneBankrupt(playerGoneBankrupt);
			});
	}
	
	function onGameWon(playGameTask) {
		return playGameTask.gameState()
			.filter(function (state) {
				return state.players().length === 1;
			})
			.map(function (state) {
				var player = state.players()[0];
				
				return Messages.logGameWon(player);
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