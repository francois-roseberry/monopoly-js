(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	var Player = require('./player');
	
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
		precondition(Player.isPlayer(info[0].player),
			'A TradeOffer requires the current player');
		precondition(_.isArray(info[0].properties),
			'A TradeOffer requires a list of properties for the current player');
		precondition(_.isNumber(info[0].money),
			'A TradeOffer requires an amount of money for the current player');
		precondition(propertiesOwnedBy(info[0].properties, info[0].player),
			'Properties offered by current player must be owned by current player');
			
		info[0].properties = realProperties(info[0].properties, info[0].player);
			
		precondition(Player.isPlayer(info[1].player),
			'A TradeOffer requires the other player');
		precondition(_.isArray(info[1].properties),
			'A TradeOffer requires a list of properties for the other player');
		precondition(_.isNumber(info[1].money),
			'A TradeOffer requires an amount of money for the other player');
		precondition(propertiesOwnedBy(info[1].properties, info[1].player),
			'Properties offered by other player must be owned by other player');
			
		info[1].properties = realProperties(info[1].properties, info[1].player);
		
		return new TradeOffer(info);
	};
	
	function propertiesOwnedBy(propertyIds, player) {
		return _.every(propertyIds, function (propertyId) {
			return !!_.find(player.properties(), function (property) {
				return property.id() === propertyId;
			});
		});
	}
	
	function realProperties(propertyIds, player) {
		return _.map(propertyIds, function (propertyId) {
			return _.find(player.properties(), function (property) {
				return property.id() === propertyId;
			});
		});
	}
	
	function TradeOffer(info) {
		this._currentPlayer = info[0].player;
		this._currentPlayerProperties = info[0].properties;
		this._currentPlayerMoney = info[0].money;
		this._otherPlayer = info[1].player;
		this._otherPlayerProperties = info[1].properties;
		this._otherPlayerMoney = info[1].money;
	}
	
	TradeOffer.prototype.isEmpty = function () {
		return this._currentPlayerProperties.length === 0 && this._currentPlayerMoney === 0 &&
			this._otherPlayerProperties.length === 0 && this._otherPlayerMoney === 0;
	};
	
	TradeOffer.prototype.isValid = function () {
		var currentPlayerOfferValid = (this._currentPlayerProperties.length > 0 || this._currentPlayerMoney > 0);
		var otherPlayerOfferValid = (this._otherPlayerProperties.length > 0 || this._otherPlayerMoney > 0);
		
		return currentPlayerOfferValid && otherPlayerOfferValid;
	};
	
	TradeOffer.prototype.currentPlayerId = function () {
		return this._currentPlayer.id();
	};
	
	TradeOffer.prototype.otherPlayerId = function () {
		return this._otherPlayer.id();
	};
	
	TradeOffer.prototype.propertiesFor = function (playerIndex) {
		return (playerIndex === 0) ? this._currentPlayerProperties.slice() : this._otherPlayerProperties.slice();
	};
	
	TradeOffer.prototype.moneyFor = function (playerIndex) {
		return (playerIndex === 0) ? this._currentPlayerMoney : this._otherPlayerMoney;
	};
	
	TradeOffer.prototype.equals = function (other) {
		if (!(other instanceof TradeOffer)) {
			return false;
		}
		
		if (this._currentPlayer.id() !== other._currentPlayer.id()) {
			return false;
		}
		
		if (this._otherPlayer.id() !== other._otherPlayer.id()) {
			return false;
		}
		
		if (this._currentPlayerMoney !== other._currentPlayerMoney) {
			return false;
		}
		
		if (this._otherPlayerMoney !== other._otherPlayerMoney) {
			return false;
		}
		
		if (!sameProperties(this._currentPlayerProperties, other._currentPlayerProperties)) {
			return false;
		}
		
		if (!sameProperties(this._otherPlayerProperties, other._otherPlayerProperties)) {
			return false;
		}
		
		return true;
	};
	
	function sameProperties(left, right) {
		if (left.length !== right.length) {
			return false;
		}
		
		return _.every(left, function (property, index) {
			return property.id() === right[index].id();
		});
	}
}());