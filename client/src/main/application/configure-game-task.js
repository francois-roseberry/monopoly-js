(function() {
	"use strict";
	
	exports.start = function () {
		return new ConfigureGameTask();
	};
	
	function ConfigureGameTask() {
		this._completed = new Rx.AsyncSubject();
		this._playerSlots = new Rx.BehaviorSubject([
			{ type: 'human' },
			{ type: 'computer' },
			{ type: 'computer' }
		]);
		this._canAddPlayerSlot = new Rx.BehaviorSubject(true);
		this._configurationValid = new Rx.BehaviorSubject(true);
	}
	
	ConfigureGameTask.prototype.playerSlots = function () {
		return this._playerSlots.asObservable();
	};
	
	ConfigureGameTask.prototype.configurationValid = function () {
		return this._configurationValid.asObservable();
	};
	
	ConfigureGameTask.prototype.addPlayerSlot = function () {
		var playerSlots = this._playerSlots;
		var canAddPlayerSlot = this._canAddPlayerSlot;
		var configurationValid = this._configurationValid;
		this._playerSlots.take(1).subscribe(function (slots) {
			slots.push({ type: 'computer' });
			playerSlots.onNext(slots);
			if (slots.length === 8) {
				canAddPlayerSlot.onNext(false);
			}
			if (slots.length > 2) {
				configurationValid.onNext(true);
			}
		});
	};
	
	ConfigureGameTask.prototype.removePlayerSlot = function () {
		var playerSlots = this._playerSlots;
		var canAddPlayerSlot = this._canAddPlayerSlot;
		var configurationValid = this._configurationValid;
		this._playerSlots.take(1).subscribe(function (slots) {
			slots.pop();
			playerSlots.onNext(slots);
			if (slots.length < 8) {
				canAddPlayerSlot.onNext(true);
			}
			
			if (slots.length < 3) {
				configurationValid.onNext(false);
			}
		});
	};
	
	ConfigureGameTask.prototype.canAddPlayerSlot = function () {
		return this._canAddPlayerSlot.asObservable();
	};
	
	ConfigureGameTask.prototype.startGame = function () {
		this._completed.onNext(true);
		this._completed.onCompleted();
	};
	
	ConfigureGameTask.prototype.completed = function () {
		return this._completed.asObservable();
	};
}());