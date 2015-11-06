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
		precondition(_.isArray(info[0].properties),
			'A TradeOffer requires a list of properties for the current player');
		precondition(_.isNumber(info[0].money),
			'A TradeOffer requires an amount of money for the current player');
		precondition(_.isArray(info[1].properties),
			'A TradeOffer requires a list of properties for the other player');
		precondition(_.isNumber(info[1].money),
			'A TradeOffer requires an amount of money for the other player');
		
		return new TradeOffer(info);
	};
	
	function TradeOffer(info) {
		this._currentPlayerProperties = info[0].properties;
		this._currentPlayerMoney = info[0].money;
		this._otherPlayerProperties = info[1].properties;
		this._otherPlayerMoney = info[1].money;
	}
	
	TradeOffer.prototype.isEmpty = function () {
		return this._currentPlayerProperties.length === 0 && this._currentPlayerMoney === 0 &&
			this._otherPlayerProperties.length === 0 && this._otherPlayerMoney === 0;
	};
	
	TradeOffer.prototype.propertiesFor = function (playerIndex) {
		return (playerIndex === 0) ? this._currentPlayerProperties : this._otherPlayerProperties;
	};
	
	TradeOffer.prototype.moneyFor = function (playerIndex) {
		return (playerIndex === 0) ? this._currentPlayerMoney : this._otherPlayerMoney;
	};
	
	TradeOffer.prototype.equals = function (other) {
		precondition(other, 'Testing a trade offer for equality with something else requires that something else');
		
		if (this === other) {
			return true;
		}
		
		
		
		return other instanceof TradeOffer && this._id === other._id;
	};
}());