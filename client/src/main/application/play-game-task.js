(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.start = function (squares, players) {
		precondition(_.isArray(squares), 'PlayGameTask requires a list of squares');
		precondition(_.isArray(players), 'PlayGameTask requires a list of players');
		
		return new PlayGameTask(squares, players);
	};
	
	function PlayGameTask(squares, players) {
		this._squares = new Rx.BehaviorSubject(squares);
		this._players = new Rx.BehaviorSubject(forGame(players));
		this._completed = new Rx.AsyncSubject();
	}
	
	function forGame(players) {
		return _.map(players, function (player, index) {
			return { name: 'Joueur ' + (index + 1), money: 1500 };
		});
	}
	
	PlayGameTask.prototype.players = function () {
		return this._players.asObservable();
	};
	
	PlayGameTask.prototype.squares = function () {
		return this._squares.asObservable();
	};
	
	PlayGameTask.prototype.completed = function () {
		return this._completed.asObservable();
	};
	
	PlayGameTask.prototype.stop = function () {
		this._completed.onNext(true);
		this._completed.onCompleted();
	};
}());