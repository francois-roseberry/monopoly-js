(function() {
	"use strict";
	
	var PlayerColors = require('./player-colors').colors();
	var Choices = require('./choices');
	var RollDiceTask = require('./roll-dice-task');
	var LogGameTask = require('./log-game-task');
	
	var precondition = require('./contract').precondition;
	
	exports.start = function (squares, players, options) {
		precondition(_.isArray(squares), 'PlayGameTask requires a list of squares');
		precondition(_.isArray(players), 'PlayGameTask requires a list of players');
		
		return new PlayGameTask(squares, players, options);
	};
	
	function PlayGameTask(squares, players, options) {
		this._gameState = new Rx.ReplaySubject(1);
		this._options = options || { fastDice: false };
		this._completed = new Rx.AsyncSubject();
		this._choices = new Rx.ReplaySubject(1);
		this._rollDiceTaskCreated = new Rx.Subject();
		this._logGameTask = LogGameTask.start(this);
		
		startTurn(this._choices, initialGameState(squares, players), this._gameState);
	}
	
	function initialGameState(squares, players) {
		return {
			squares: squares,
			players: forGame(players),
			currentPlayerIndex: 0
		};
	}
	
	function forGame(players) {
		return _.map(players, function (player, index) {
			return {
				name: 'Joueur ' + (index + 1),
				money: 1500,
				position: 0,
				color: PlayerColors[index]
			};
		});
	}
	
	function startTurn(choices, newState, gameState) {
		gameState.onNext(newState);
		choices.onNext([Choices.rollDice()]);
	}
	
	PlayGameTask.prototype.messages = function () {
		return this._logGameTask.messages();
	};
	
	PlayGameTask.prototype.gameState = function () {
		return this._gameState.asObservable();
	};
	
	PlayGameTask.prototype.choices = function () {
		return this._choices.asObservable();
	};
	
	PlayGameTask.prototype.rollDiceTaskCreated = function () {
		return this._rollDiceTaskCreated.asObservable();
	};
	
	PlayGameTask.prototype.completed = function () {
		return this._completed.asObservable();
	};
	
	PlayGameTask.prototype.stop = function () {
		this._completed.onNext(true);
		this._completed.onCompleted();
	};
	
	PlayGameTask.prototype.makeChoice = function (choice) {
		var self = this;
		this._choices.onNext([]);
		self._gameState.take(1).subscribe(function (state) {
			choice.match({
				'roll-dice': rollDice(self, state),
				'finish-turn': finishTurn(self, state)
			});
		});
	};
	
	function rollDice(self, state) {
		return function () {
		var task = RollDiceTask.start({
			fast: self._options.fastDice,
			dieFunction: self._options.dieFunction
		});
		
		self._rollDiceTaskCreated.onNext(task);
		task.diceRolled().last()
			.subscribe(function (dice) {
				var newPosition = state.players[state.currentPlayerIndex].position + dice[0] + dice[1];
				state.players[state.currentPlayerIndex].position = newPosition % state.squares.length;
				self._gameState.onNext(state);
				self._choices.onNext(choicesForSquare(state));				
			});
		};
	}
	
	function choicesForSquare(state) {
		return [Choices.finishTurn()];
	}
	
	function finishTurn(self, state) {
		return function () {
			startTurn(self._choices, nextPlayer(state), self._gameState);
		};
	}
	
	function nextPlayer(state) {
		return {
			squares: state.squares,
			players: state.players,
			currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length
		};
	}
}());