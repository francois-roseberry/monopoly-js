(function() {
	"use strict";
	
	var Square = require('./square');
	
	var precondition = require('./contract').precondition;
	
	exports.start = function () {
		return new GameTask();
	};

	function GameTask() {
		this._statusChanged = new Rx.BehaviorSubject(configuringStatus());
	}
	
	function configuringStatus() {
		return {
			statusName: 'configuring',
			match: function (visitor) {
				visitor.configuring();
			}
		};
	}
	
	function playingStatus(players) {
		return {
			statusName: 'playing',
			match: function (visitor) {
				visitor.playing(Square.SQUARES, players);
			}
		};
	}
	
	GameTask.prototype.startGame = function (players) {
		precondition(_.isArray(players), 'Game task requires the list of players to start the game');
		
		var self = this;
		this._statusChanged.take(1).subscribe(function (status) {
			if (status.statusName === 'configuring') {
				self._statusChanged.onNext(playingStatus(players));
			}
		});
	};
	
	GameTask.prototype.newGame = function () {
		this._statusChanged.onNext(configuringStatus());
	};
	
	GameTask.prototype.statusChanged = function () {
		return this._statusChanged.asObservable();
	};
}());