(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.start = function () {
		return new ConfigureGameTask();
	};
	
	function ConfigureGameTask() {
		this._availablePlayerTypes = ['human', 'computer'];
		this._completed = new Rx.AsyncSubject();
		this._playerSlots = new Rx.BehaviorSubject([
			{ type: this._availablePlayerTypes[0] },
			{ type: this._availablePlayerTypes[1] },
			{ type: this._availablePlayerTypes[1] }
		]);
		this._canAddPlayerSlot = new Rx.BehaviorSubject(true);
		this._configurationValid = new Rx.BehaviorSubject(true);
	}
	
	ConfigureGameTask.prototype.availablePlayerTypes = function () {
		return this._availablePlayerTypes.slice();
	};
	
	ConfigureGameTask.prototype.playerSlots = function () {
		return this._playerSlots.takeUntil(this._completed);
	};
	
	ConfigureGameTask.prototype.configurationValid = function () {
		return this._configurationValid.takeUntil(this._completed);
	};
	
	ConfigureGameTask.prototype.addPlayerSlot = function (type) {
		precondition(_.contains(this._availablePlayerTypes, type), 'Player type [' + type + '] is not authorized');
		
		var playerSlots = this._playerSlots;
		var canAddPlayerSlot = this._canAddPlayerSlot;
		var configurationValid = this._configurationValid;
		this._playerSlots.take(1).subscribe(function (slots) {
			slots.push({ type: type });
			playerSlots.onNext(slots);
			if (slots.length === 8) {
				canAddPlayerSlot.onNext(false);
			}
			if (slots.length > 2) {
				configurationValid.onNext(true);
			}
		});
	};
	
	ConfigureGameTask.prototype.removePlayerSlot = function (slotIndex) {
		precondition(_.isNumber(slotIndex) && slotIndex >= 0, 'Removing a player slot requires its index');
		
		var playerSlots = this._playerSlots;
		var canAddPlayerSlot = this._canAddPlayerSlot;
		var configurationValid = this._configurationValid;
		this._playerSlots.take(1).subscribe(function (slots) {
			precondition(slotIndex < slots.length, 'Removing a player slot requires its index to be valid');
			
			slots.splice(slotIndex, 1);
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
		return this._canAddPlayerSlot.takeUntil(this._completed);
	};
	
	ConfigureGameTask.prototype.startGame = function () {
		this._completed.onNext(true);
		this._completed.onCompleted();
	};
}());