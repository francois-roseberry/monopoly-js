(function() {
	"use strict";
	
	var PlayerColors = require('./player-colors').colors();
	var Choices = require('./choices');
	var RollDiceTask = require('./roll-dice-task');
	
	var precondition = require('./contract').precondition;
	
	exports.start = function (squares, players) {
		precondition(_.isArray(squares), 'PlayGameTask requires a list of squares');
		precondition(_.isArray(players), 'PlayGameTask requires a list of players');
		
		return new PlayGameTask(squares, players);
	};
	
	function PlayGameTask(squares, players) {
		this._gameState = new Rx.BehaviorSubject(initialGameState(squares, players));
		this._completed = new Rx.AsyncSubject();
		this._choices = new Rx.ReplaySubject(1);
		this._choiceMade = new Rx.Subject();
		this._rollDiceTaskCreated = new Rx.Subject();
		
		this._choices.onNext([Choices.rollDice()]);
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
	
	PlayGameTask.prototype.gameState = function () {
		return this._gameState.asObservable();
	};
	
	PlayGameTask.prototype.choices = function () {
		return this._choices.asObservable();
	};
	
	PlayGameTask.prototype.choiceMade = function () {
		return this._choiceMade.asObservable();
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
		// TODO : validate choice is legal
		this._choiceMade.onNext(choice);
		this._choices.onNext([]);
		if (choice === Choices.rollDice().id) {
			this._rollDiceTaskCreated.onNext(RollDiceTask.start());
		}
	};
}());