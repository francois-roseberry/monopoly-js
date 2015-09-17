(function() {
	"use strict";
	
	var Board = require('./board');
	var PlayGameTask = require('./play-game-task');
	var ConfigureGameTask = require('./configure-game-task');
	
	exports.start = function () {
		return new GameTask();
	};

	function GameTask() {
		this._statusChanged = new Rx.ReplaySubject(1);
		this._statusChanged.onNext(configuringStatus(this._statusChanged));
	}
	
	function configuringStatus(statusChanged) {
		var task = ConfigureGameTask.start();
		task.playerSlots().last()
			.subscribe(function (players) {
				startGame(players, statusChanged);
			});
		
		return {
			statusName: 'configuring',
			match: function (visitor) {
				visitor.configuring(task);
			}
		};
	}
	
	function playingStatus(players, statusChanged) {
		var gameConfiguration = { squares: Board.squares(), players: players, options: { fastDice: false }};
		var task = PlayGameTask.start(gameConfiguration);
		task.completed().subscribe(function () {
			newGame(statusChanged);
		});
				
		return {
			statusName: 'playing',
			match: function (visitor) {
				visitor.playing(task);
			}
		};
	}
	
	function newGame(statusChanged) {
		statusChanged.onNext(configuringStatus(statusChanged));
	}
	
	function startGame(players, statusChanged) {
		statusChanged.onNext(playingStatus(players, statusChanged));
	}
	
	GameTask.prototype.statusChanged = function () {
		return this._statusChanged.asObservable();
	};
}());