(function() {
	"use strict";
	
	var Board = require('./board');
	var PlayGameTask = require('./play-game-task');
	var ConfigureGameTask = require('./configure-game-task');
	
	exports.start = function () {
		return new GameTask();
	};

	function GameTask() {
		this._status = new Rx.BehaviorSubject(configuringStatus(this));
	}
	
	function configuringStatus(self) {
		var task = ConfigureGameTask.start();
		task.playerSlots().last()
			.subscribe(function (players) {
				startGame(players, self);
			});
		
		return {
			statusName: 'configuring',
			match: function (visitor) {
				visitor.configuring(task);
			}
		};
	}
	
	function playingStatus(players, self) {
		var gameConfiguration = { board: Board.standard(), players: players, options: { fastDice: false }};
		var task = PlayGameTask.start(gameConfiguration);
		task.completed().subscribe(function () {
			newGame(self);
		});
				
		return {
			statusName: 'playing',
			match: function (visitor) {
				visitor.playing(task);
			}
		};
	}
	
	function newGame(self) {
		self._status.onNext(configuringStatus(self));
	}
	
	function startGame(players, self) {
		self._status.onNext(playingStatus(players, self));
	}
	
	GameTask.prototype.status = function () {
		return this._status.asObservable();
	};
}());