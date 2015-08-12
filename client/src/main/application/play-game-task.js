(function() {
	"use strict";
	
	var PlayerColors = require('./player-colors').colors();
	
	var precondition = require('./contract').precondition;
	
	exports.start = function (squares, players) {
		precondition(_.isArray(squares), 'PlayGameTask requires a list of squares');
		precondition(_.isArray(players), 'PlayGameTask requires a list of players');
		
		return new PlayGameTask(squares, players);
	};
	
	function PlayGameTask(squares, players) {
		this._gameState = new Rx.BehaviorSubject(initialGameState(squares, players));
		this._completed = new Rx.AsyncSubject();
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
	
	PlayGameTask.prototype.completed = function () {
		return this._completed.asObservable();
	};
	
	PlayGameTask.prototype.stop = function () {
		this._completed.onNext(true);
		this._completed.onCompleted();
	};
}());