(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.start = function () {
		return new ConfigureGameTask();
	};
	
	function ConfigureGameTask() {
		this._completed = new Rx.AsyncSubject();
		this._computersCount = 1;
	}
	
	ConfigureGameTask.prototype.getComputers = function () {
		return this._computersCount;
	};
	
	ConfigureGameTask.prototype.setComputers = function (count) {
		precondition(_.isNumber(count) && count > 0 && count < 8,
			'The number of computer players must be between 1 and 7');
			
		this._computersCount = count;
	};
	
	ConfigureGameTask.prototype.startGame = function () {
		this._completed.onNext(players(this._computersCount));
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