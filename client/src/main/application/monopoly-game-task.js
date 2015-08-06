(function() {
	"use strict";
	
	var startSquare = {};
	
	exports.start = function () {
		return new MonopolyGameTask();
	};

	function MonopolyGameTask() {
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
	
	function playingStatus() {
		return {
			statusName: 'playing',
			match: function (visitor) {
				visitor.playing(startSquare);
			}
		};
	}
	
	MonopolyGameTask.prototype.startGame = function () {
		var self = this;
		this._statusChanged.take(1).subscribe(function (status) {
			if (status.statusName === 'configuring') {
				self._statusChanged.onNext(playingStatus());
			}
		});
	};
	
	MonopolyGameTask.prototype.newGame = function () {
		this._statusChanged.onNext(configuringStatus());
	};
	
	MonopolyGameTask.prototype.statusChanged = function () {
		return this._statusChanged.asObservable();
	};
}());