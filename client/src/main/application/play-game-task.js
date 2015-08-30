(function() {
	"use strict";
	
	var PlayerColors = require('./player-colors').colors();
	var Choices = require('./choices');
	var RollDiceTask = require('./roll-dice-task');
	var LogGameTask = require('./log-game-task');
	var HandleChoicesTask = require('./handle-choices-task');
	
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
		this._rollDiceTaskCreated = new Rx.Subject();
		this._logGameTask = LogGameTask.start(this);
		
		this._handleChoicesTask = HandleChoicesTask.start(this);
		listenForChoices(this);
		
		startTurn(this, initialGameState(squares, players));
	}
	
	function listenForChoices(self) {
		self._handleChoicesTask.choiceMade()
			.takeUntil(self._completed)
			.subscribe(makeChoice(self));
	}
	
	function initialGameState(squares, players) {
		return newState({
			squares: squares,
			players: forGame(players),
			currentPlayerIndex: 0,
			choices: newTurnChoices()
		});
	}
	
	function forGame(players) {
		return _.map(players, function (player, index) {
			return newPlayer({
				name: 'Joueur ' + (index + 1),
				money: 1500,
				position: 0,
				color: PlayerColors[index],
				type: player.type
			});
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
	
	PlayGameTask.prototype.completed = function () {
		return this._completed.asObservable();
	};
	
	PlayGameTask.prototype.stop = function () {
		this._completed.onNext(true);
		this._completed.onCompleted();
	};
	
	function newPlayer(info) {
		precondition(_.isString(info.name) && info.name !== '', 'Player requires a name');
		precondition(_.isNumber(info.money) && info.money >= 0, 'Player requires an amount of money');
		precondition(_.isNumber(info.position) && info.position >= 0, 'Player requires a position');
		precondition(_.isString(info.color) && info.color !== '', 'Player requires a color');
		precondition(_.isString(info.type) && validPlayerType(info.type), 'Player requires a valid type');
		
		return {
			name: function () { return info.name; },
			money: function () { return info.money; },
			position: function () { return info.position; },
			color: function () { return info.color; },
			type: function () { return info.type; }
		};
	}
	
	function validPlayerType(type) {
		return type === 'human' || type === 'computer';
	}
	
	function newState(info) {
		precondition(_.isArray(info.squares) && info.squares.length === 40,
			'GameState requires an array of squares');
		precondition(_.isArray(info.players) && info.players.length >= 2,
			'GameState requires an array of players');
		precondition(_.isNumber(info.currentPlayerIndex) && validIndex(info.players, info.currentPlayerIndex),
			'GameState requires the index of the current player');
		precondition(_.isArray(info.choices) && info.choices.length > 0,
			'GameState requires an array of choices');
		
		return {
			squares: function () { return info.squares; },
			players: function () { return info.players; },
			currentPlayerIndex: function () { return info.currentPlayerIndex; },
			choices: function () { return info.choices; }
		};
	}
	
	function validIndex(array, index) {
		return index >= 0 && index < array.length;
	}
	
	function makeChoice (self) {
		return function (choice) {
			self._gameState.take(1).subscribe(function (state) {
				choice.match({
					'roll-dice': rollDice(self, state),
					'finish-turn': finishTurn(self, state)
				});
			});
		};
	}
	
	function rollDice(self, state) {
		return function () {
			var task = RollDiceTask.start({
				fast: self._options.fastDice,
				dieFunction: self._options.dieFunction
			});
			
			self._rollDiceTaskCreated.onNext(task);
			task.diceRolled().last()
				.subscribe(function (dice) {
					self._gameState.onNext(movePlayer(state, dice));			
				});
		};
	}
	
	function choicesForSquare(state) {
		return [Choices.finishTurn()];
	}
	
	function finishTurn(self, state) {
		return function () {
			startTurn(self, nextPlayer(state));
		};
	}
	
	function movePlayer(state, dice) {
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return newPlayer({
					name: player.name(),
					money: player.money(),
					position: (player.position() + dice[0] + dice[1]) % state.squares().length,
					color: player.color(),
					type: player.type()
				});
			}
			
			return player;
		});
		
		return newState({
			squares: state.squares(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex(),
			choices: choicesForSquare(state)
		});
	}
	
	function nextPlayer(state) {
		return newState({
			squares: state.squares(),
			players: state.players(),
			currentPlayerIndex: (state.currentPlayerIndex() + 1) % state.players().length,
			choices: newTurnChoices()
		});
	}
	
	function newTurnChoices() {
		return [Choices.rollDice()];
	}
}());