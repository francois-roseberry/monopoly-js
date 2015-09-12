(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.start = function () {
		return new ConfigureGameTask();
	};
	
	function ConfigureGameTask() {
		this._completed = new Rx.AsyncSubject();
		this._players = new Rx.BehaviorSubject(players(2));
	}
	
	ConfigureGameTask.prototype.players = function () {
		return this._players.asObservable();
	};
	
	ConfigureGameTask.prototype.setComputers = function (count) {
		precondition(_.isNumber(count) && count > 1 && count < 8,
			'The number of computer players must be between 2 and 7');
			
		this._players.onNext(players(count));
	};
	
	ConfigureGameTask.prototype.startGame = function () {
		this._completed.onNext(true);
		this._completed.onCompleted();
	};
	
	ConfigureGameTask.prototype.completed = function () {
		return this._completed.asObservable();
	};
	
	function players(computers) {
		var allPlayers = [{ type: 'human' }];
		for (var i = 0; i < computers; i++) {
			allPlayers.push({ type: 'computer' });
		}
		return allPlayers;
	}
}());