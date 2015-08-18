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
		this._gameState = new Rx.BehaviorSubject(initialGameState(squares, players));
		this._options = options || { fastDice: false };
		this._completed = new Rx.AsyncSubject();
		this._choices = new Rx.ReplaySubject(1);
		this._rollDiceTaskCreated = new Rx.Subject();
		this._logGameTask = LogGameTask.start(this);
		
		startTurn(this._choices);
	}
	
	function initialGameState(squares, players) {
		return {
			squares: squares,
			players: forGame(players)
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
	
	function startTurn(choices) {
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
		if (choice === Choices.rollDice().id) {
			var task = RollDiceTask.start({
				fast: this._options.fastDice,
				dieFunction: this._options.dieFunction
			});
			
			this._rollDiceTaskCreated.onNext(task);
			task.diceRolled().last()
				.subscribe(function (dice) {
					self._gameState.take(1).subscribe(function (state) {
						var newPosition = state.players[0].position + dice[0] + dice[1];
						state.players[0].position = newPosition % state.squares.length;
						self._gameState.onNext(state);
						self._choices.onNext(choicesForSquare(state));
					});
				});
		} else if (choice === Choices.finishTurn().id) {
			startTurn(this._choices);
		}
	};
	
	function choicesForSquare(state) {
		/*state.squares[state.players[0].position].match({
							
		});*/
		
		return [Choices.finishTurn()];
	}
}());