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
		this._selectedProperties = [];
		this._currentPlayerMoneyOffer = 0;
		this._otherPlayerMoneyOffer = 0;
		
		this._offer = new Rx.BehaviorSubject(currentOffer(this));
	}
	
	TradeTask.prototype.currentPlayer = function () {
		return this._currentPlayer;
	};
	
	TradeTask.prototype.otherPlayer = function () {
		return this._otherPlayer;
	};
	
	TradeTask.prototype.togglePropertySelection = function (propertyId) {
		if (_.contains(this._selectedProperties, propertyId)) {
			this._selectedProperties = _.without(this._selectedProperties, propertyId);
		} else {
			this._selectedProperties = this._selectedProperties.concat([propertyId]);
		}
			
		this._offer.onNext(currentOffer(this));
	};
	
	TradeTask.prototype.setMoneyOfferedByCurrentPlayer = function (money) {
		precondition(_.isNumber(money) && money >= 0 && money <= this._currentPlayer.money(),
			'A player can only offer an amount of money between 0 and the total he has (inclusively)');
			
		this._currentPlayerMoneyOffer = money;
		this._offer.onNext(currentOffer(this));
	};
	
	TradeTask.prototype.setMoneyOfferedByOtherPlayer = function (money) {
		precondition(_.isNumber(money) && money >= 0 && money <= this._otherPlayer.money(),
			'A player can only offer an amount of money between 0 and the total he has (inclusively)');
			
		this._otherPlayerMoneyOffer = money;
		this._offer.onNext(currentOffer(this));
	};
	
	TradeTask.prototype.offer = function () {
		return this._offer.asObservable();
	};
	
	function currentOffer(self) {
		return {
			properties: self._selectedProperties,
			currentPlayer: {
				money: self._currentPlayerMoneyOffer
			},
			otherPlayer: {
				money: self._otherPlayerMoneyOffer
			}
		};
	}
}());