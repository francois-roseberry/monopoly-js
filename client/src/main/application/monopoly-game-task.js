(function() {
	"use strict";
	
	exports.start = function () {
		return new MonopolyGameTask();
	};

	function MonopolyGameTask() {
		this._statusChanged = new Rx.BehaviorSubject(configuringStatus());
	}
	
	function configuringStatus() {
		return {
			statusName: 'configuring',
			match : function (visitor) {
				visitor.configuring();
			}
		};
	}
	
	MonopolyGameTask.prototype.statusChanged = function () {
		return this._statusChanged.asObservable();
	};
}());