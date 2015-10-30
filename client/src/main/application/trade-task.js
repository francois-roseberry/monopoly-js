(function() {
	"use strict";
	
	var Player = require('./player');
	
	var precondition = require('./contract').precondition;
	
	exports.start = function (currentPlayer, otherPlayer) {
		precondition(Player.isPlayer(currentPlayer), 'A TradeTask requires a current player');
		precondition(Player.isPlayer(otherPlayer), 'A TradeTask requires another player');
		
		return new TradeTask(currentPlayer, otherPlayer);
	};
	
	function TradeTask(currentPlayer, otherPlayer) {
		this._currentPlayer = currentPlayer;
		this._otherPlayer = otherPlayer;
		this._selectedProperties = new Rx.BehaviorSubject([]);
	}
	
	TradeTask.prototype.currentPlayer = function () {
		return this._currentPlayer;
	};
	
	TradeTask.prototype.otherPlayer = function () {
		return this._otherPlayer;
	};
	
	TradeTask.prototype.togglePropertySelection = function (propertyId) {
		var selectedProperties = this._selectedProperties;
		selectedProperties.take(1).subscribe(function (properties) {
			var newProperties;
			if (_.contains(properties, propertyId)) {
				newProperties = _.without(properties, propertyId);
			} else {
				newProperties = properties.concat([propertyId]);
			}
			
			selectedProperties.onNext(newProperties);
		});
	};
	
	TradeTask.prototype.selectedProperties = function () {
		return this._selectedProperties.asObservable();
	};
}());