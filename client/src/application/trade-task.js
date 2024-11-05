(function() {
	"use strict";
	
	var Player = require('./player');
	var TradeOffer = require('./trade-offer');
	
	var precondition = require('./contract').precondition;
	
	exports.start = function (currentPlayer, otherPlayer) {
		precondition(Player.isPlayer(currentPlayer), 'A TradeTask requires a current player');
		precondition(Player.isPlayer(otherPlayer), 'A TradeTask requires another player');
		
		return new TradeTask(currentPlayer, otherPlayer);
	};
	
	function TradeTask(currentPlayer, otherPlayer) {
		this._currentPlayer = currentPlayer;
		this._otherPlayer = otherPlayer;
		this._currentPlayerPropertiesOffer = [];
		this._otherPlayerPropertiesOffer = [];
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
	
	TradeTask.prototype.togglePropertyOfferedByPlayer = function (propertyId, playerIndex) {
		precondition(_.isString(propertyId), 'Requires a property id');
		precondition(_.isNumber(playerIndex) && (playerIndex === 0 || playerIndex === 1),
			'Only the player with index 0 or 1 can offer something');
			
		var properties = (playerIndex === 0) ?
			this._currentPlayerPropertiesOffer :
			this._otherPlayerPropertiesOffer;
		
		if (_.contains(properties, propertyId)) {
			properties = _.without(properties, propertyId);
		} else {
			properties = properties.concat([propertyId]);
		}
		
		setPropertiesOfferFor(playerIndex, properties, this);
		
		this._offer.onNext(currentOffer(this));
	};
	
	function setPropertiesOfferFor(playerIndex, properties, self) {
		if (playerIndex === 0) {
			self._currentPlayerPropertiesOffer = properties;
		} else {
			self._otherPlayerPropertiesOffer = properties;
		}
	}
	
	TradeTask.prototype.setMoneyOfferedByPlayer = function (money, playerIndex) {
		precondition(_.isNumber(money) && money >= 0,
			'A player can only offer an amount of money greater than or equal to 0');
		precondition(_.isNumber(playerIndex) && (playerIndex === 0 || playerIndex === 1),
			'Only the player with index 0 or 1 can offer something');
			
		if (playerIndex === 0) {
			precondition(money <= this._currentPlayer.money(),
				'A player cannot offer more money than he has');
			
			this._currentPlayerMoneyOffer = money;
		} else {
			precondition(money <= this._otherPlayer.money(),
				'A player cannot offer more money than he has');
				
			this._otherPlayerMoneyOffer = money;
		}
		
		this._offer.onNext(currentOffer(this));
	};
	
	TradeTask.prototype.makeOffer = function () {
		this._offer.onCompleted();
	};
	
	TradeTask.prototype.cancel = function () {
		this._offer.onNext(TradeOffer.emptyOffer());
		this._offer.onCompleted();
	};
	
	TradeTask.prototype.offer = function () {
		return this._offer.asObservable();
	};
	
	function currentOffer(self) {
		return TradeOffer.newOffer([
			{
				player: self._currentPlayer,
				properties: self._currentPlayerPropertiesOffer,
				money: self._currentPlayerMoneyOffer
			},
			{
				player: self._otherPlayer,
				properties: self._otherPlayerPropertiesOffer,
				money: self._otherPlayerMoneyOffer
			}
		]);
	}
}());