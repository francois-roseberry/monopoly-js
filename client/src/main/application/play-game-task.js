(function() {
	"use strict";
	
	var RollDiceTask = require('./roll-dice-task');
	var TradeTask = require('./trade-task');
	var LogGameTask = require('./log-game-task');
	var HandleChoicesTask = require('./handle-choices-task');
	var Player = require('./player');
	var GameState = require('./game-state');
	var TradeOffer = require('./trade-offer');
	var Board = require('./board');
	
	var precondition = require('./contract').precondition;
	
	exports.start = function (gameConfiguration) {
		precondition(Board.isBoard(gameConfiguration.board),
			'PlayGameTask requires a configuration with a board');
		precondition(_.isArray(gameConfiguration.players),
			'PlayGameTask requires a configuration with a list of players');
		precondition(gameConfiguration.options,
			'PlayGameTask requires a configuration with an options object');
		
		var task = new PlayGameTask(gameConfiguration);
		
		listenForChoices(task);	
		
		return task;
	};
	
	function PlayGameTask(gameConfiguration) {		
		this._options = gameConfiguration.options;
		this._completed = new Rx.AsyncSubject();
		this._rollDiceTaskCreated = new Rx.Subject();
		this._tradeTaskCreated = new Rx.Subject();
		
		var initialState = initialGameState(gameConfiguration.board, gameConfiguration.players);
		
		this._gameState = new Rx.BehaviorSubject(initialState);
		
		this._logGameTask = LogGameTask.start(this);
		this._handleChoicesTask = HandleChoicesTask.start(this);	
	}
	
	function listenForChoices(self) {
		self._handleChoicesTask.choiceMade()
			.withLatestFrom(self._gameState, function (action, state) {
				return {
					choice: action.choice,
					arg: action.arg,
					state: state
				};
			})
			.flatMap(computeNextState(self))
			//.subscribe(self._gameState);
			.subscribe(function (state) {
				self._gameState.onNext(state);
			});
	}
	
	function initialGameState(board, players) {
		return GameState.turnStartState({
			board: board,
			players: Player.newPlayers(players, board.playerParameters()),
			currentPlayerIndex: 0
		});
	}
	
	PlayGameTask.prototype.handleChoicesTask = function () {
		return this._handleChoicesTask;
	};
	
	PlayGameTask.prototype.messages = function () {
		return this._logGameTask.messages().takeUntil(this._completed);
	};
	
	PlayGameTask.prototype.gameState = function () {
		return this._gameState.asObservable();//.takeUntil(this._completed);
	};
	
	PlayGameTask.prototype.rollDiceTaskCreated = function () {
		return this._rollDiceTaskCreated.takeUntil(this._completed);
	};
	
	PlayGameTask.prototype.tradeTaskCreated = function () {
		return this._tradeTaskCreated.takeUntil(this._completed);
	};
	
	PlayGameTask.prototype.completed = function () {
		return this._completed.asObservable();
	};
	
	PlayGameTask.prototype.stop = function () {
		this._handleChoicesTask.stop();
		
		this._completed.onNext(true);
		this._completed.onCompleted();
	};
	
	function computeNextState(self) {
		return function (action) {
			if (action.choice.requiresDice()) {
				return computeNextStateWithDice(self, action.state, action.choice);
			}
			
			if (_.isFunction(action.choice.requiresTrade)) {
				return computeNextStateWithTrade(self, action.state, action.choice, action.arg);
			}
			
			var nextState = action.choice.computeNextState(action.state);
			return Rx.Observable.return(nextState);
		};
	}
	
	function computeNextStateWithDice(self, state, choice) {
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
	
	function computeNextStateWithTrade(self, state, choice, arg) {
		if (TradeOffer.isOffer(arg) && !arg.isEmpty()) {
			var nextState = choice.computeNextState(state, arg);
			return Rx.Observable.return(nextState);
		}
				
		var currentPlayer = state.players()[state.currentPlayerIndex()];
		var otherPlayer = choice.otherPlayer();
		var task = TradeTask.start(currentPlayer, otherPlayer);
		
		self._tradeTaskCreated.onNext(task);
		return task.offer().last()
			.map(function (offer) {
				return choice.computeNextState(state, offer);
			});
	}
}());