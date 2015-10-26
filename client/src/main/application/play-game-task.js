(function() {
	"use strict";
	
	var RollDiceTask = require('./roll-dice-task');
	var TradeTask = require('./trade-task');
	var LogGameTask = require('./log-game-task');
	var HandleChoicesTask = require('./handle-choices-task');
	var Player = require('./player');
	var GameState = require('./game-state');
	var CancelTradeChoice = require('./cancel-trade-choice');
	
	var precondition = require('./contract').precondition;
	
	exports.start = function (gameConfiguration) {
		precondition(_.isArray(gameConfiguration.squares),
			'PlayGameTask requires a configuration with a list of squares');
		precondition(_.isArray(gameConfiguration.players),
			'PlayGameTask requires a configuration with a list of players');
		precondition(gameConfiguration.options,
			'PlayGameTask requires a configuration with an options object');
		
		return new PlayGameTask(gameConfiguration);
	};
	
	function PlayGameTask(gameConfiguration) {
		this._gameState = new Rx.ReplaySubject(1);
		this._options = gameConfiguration.options;
		this._completed = new Rx.AsyncSubject();
		this._rollDiceTaskCreated = new Rx.Subject();
		this._tradeTaskCreated = new Rx.Subject();
		this._logGameTask = LogGameTask.start(this);
		
		this._handleChoicesTask = HandleChoicesTask.start(this);
		listenForChoices(this);
		
		startTurn(this, initialGameState(gameConfiguration.squares, gameConfiguration.players));
	}
	
	function listenForChoices(self) {
		self._handleChoicesTask.choiceMade()
			.takeUntil(self._completed)
			.subscribe(makeChoice(self));
	}
	
	function initialGameState(squares, players) {
		return GameState.turnStartState({
			squares: squares,
			players: Player.newPlayers(players),
			currentPlayerIndex: 0
		});
	}
	
	function startTurn(self, state) {
		self._gameState.onNext(state);
	}
	
	PlayGameTask.prototype.handleChoicesTask = function () {
		return this._handleChoicesTask;
	};
	
	PlayGameTask.prototype.messages = function () {
		return this._logGameTask.messages();
	};
	
	PlayGameTask.prototype.gameState = function () {
		return this._gameState.asObservable();
	};
	
	PlayGameTask.prototype.rollDiceTaskCreated = function () {
		return this._rollDiceTaskCreated.asObservable();
	};
	
	PlayGameTask.prototype.tradeTaskCreated = function () {
		return this._tradeTaskCreated.asObservable();
	};
	
	PlayGameTask.prototype.completed = function () {
		return this._completed.asObservable();
	};
	
	PlayGameTask.prototype.stop = function () {
		this._completed.onNext(true);
		this._completed.onCompleted();
	};
	
	function makeChoice(self) {
		return function (choice) {
			self._gameState.take(1)
				.flatMap(computeNextState(self, choice))
				.subscribe(function (state) {
					self._gameState.onNext(state);
					
					var choiceIds = state.choices().map(function (choice) { return choice.id; });
					if (_.contains(choiceIds, CancelTradeChoice.newChoice().id)) {
						self._tradeTaskCreated.onNext(TradeTask.start());
					}
				});			
		};
	}
	
	function computeNextState(self, choice) {
		return function (state) {
			if (choice.requiresDice()) {
				var task = RollDiceTask.start({
					fast: self._options.fastDice,
					dieFunction: self._options.dieFunction
				});
				
				self._rollDiceTaskCreated.onNext(task);
				return task.diceRolled().last()
					.map(function (dice) {
						return choice.computeNextState(state, dice);
					});
			}
			
			var nextState = choice.computeNextState(state);
			return Rx.Observable.return(nextState);
		};
	}
}());