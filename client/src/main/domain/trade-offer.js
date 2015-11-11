(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.isOffer = function (candidate) {
		return candidate instanceof TradeOffer;
	};
	
	exports.emptyOffer = function () {
		return new TradeOffer([
			{
				properties: [],
				money: 0
			},
			{
				properties: [],
				money: 0
			}
		]);
	};
	
	exports.newOffer = function (info) {
		precondition(_.isString(info[0].playerId),
			'A TradeOffer requires the id of current player');
		precondition(_.isArray(info[0].properties),
			'A TradeOffer requires a list of properties for the current player');
		precondition(_.isNumber(info[0].money),
			'A TradeOffer requires an amount of money for the current player');
			
		precondition(_.isString(info[1].playerId),
			'A TradeOffer requires the id of other player');
		precondition(_.isArray(info[1].properties),
			'A TradeOffer requires a list of properties for the other player');
		precondition(_.isNumber(info[1].money),
			'A TradeOffer requires an amount of money for the other player');
		
		return new TradeOffer(info);
	};
	
	function TradeOffer(info) {
		this._currentPlayerId = info[0].playerId;
		this._currentPlayerProperties = info[0].properties;
		this._currentPlayerMoney = info[0].money;
		this._otherPlayerId = info[1].playerId;
		this._otherPlayerProperties = info[1].properties;
		this._otherPlayerMoney = info[1].money;
	}
	
	TradeOffer.prototype.isEmpty = function () {
		return this._currentPlayerProperties.length === 0 && this._currentPlayerMoney === 0 &&
			this._otherPlayerProperties.length === 0 && this._otherPlayerMoney === 0;
	};
	
	TradeOffer.prototype.currentPlayerId = function () {
		return this._currentPlayerId;
	};
	
	TradeOffer.prototype.otherPlayerId = function () {
		return this._otherPlayerId;
	};
	
	TradeOffer.prototype.propertiesFor = function (playerIndex) {
		return (playerIndex === 0) ? this._currentPlayerProperties : this._otherPlayerProperties;
	};
	
	TradeOffer.prototype.moneyFor = function (playerIndex) {
		return (playerIndex === 0) ? this._currentPlayerMoney : this._otherPlayerMoney;
	};
	
	TradeOffer.prototype.equals = function (other) {
		if (!(other instanceof TradeOffer)) {
			return false;
		}
		
		if (this._currentPlayerId !== other._currentPlayerId) {
			return false;
		}
		
		if (this._otherPlayerId !== other._otherPlayerId) {
			return false;
		}
		
		if (this._currentPlayerMoney !== other._currentPlayerMoney) {
			return false;
		}
		
		if (this._otherPlayerMoney !== other._otherPlayerMoney) {
			return false;
		}
		
		if (!arrayEquals(this._currentPlayerProperties, other._currentPlayerProperties)) {
			return false;
		}
		
		if (!arrayEquals(this._otherPlayerProperties, other._otherPlayerProperties)) {
			return false;
		}
		
		return true;
	};
	
	function arrayEquals(left, right) {
		if (left.length !== right.length) {
			return false;
		}
		
		_.each(left, function (element, index) {
			if (element !== right[index]) {
				return false;
			}
		});
		
		return true;
	}
}());