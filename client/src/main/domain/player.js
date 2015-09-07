(function() {
	"use strict";
	
	var PlayerColors = require('./player-colors').colors();
	
	var precondition = require('./contract').precondition;
	var i18n = require('./i18n').i18n();
	
	exports.newPlayers = function (playerConfigurations) {
		return _.map(playerConfigurations, function (playerConfiguration, index) {
			return newPlayer({
				id: 'player' + index,
				name: i18n.DEFAULT_PLAYER_NAME.replace('{index}', index + 1),
				money: 1500,
				position: 0,
				color: PlayerColors[index],
				type: playerConfiguration.type,
				properties: []
			});
		});
	};
	
	function newPlayer(info) {
		precondition(_.isString(info.id) && info.id !== '', 'Player requires an id');
		precondition(_.isString(info.name) && info.name !== '', 'Player requires a name');
		precondition(_.isNumber(info.money) && info.money >= 0, 'Player requires an amount of money');
		precondition(_.isNumber(info.position) && info.position >= 0, 'Player requires a position');
		precondition(_.isString(info.color) && info.color !== '', 'Player requires a color');
		precondition(_.isString(info.type) && validPlayerType(info.type), 'Player requires a valid type');
		precondition(_.isArray(info.properties), 'Player requires a list of properties');
		
		return new Player(info);
	}
	
	function validPlayerType(type) {
		return type === 'human' || type === 'computer';
	}
	
	function Player(info) {
		this._id = info.id;
		this._name = info.name;
		this._money = info.money;
		this._position = info.position;
		this._color = info.color;
		this._type = info.type;
		this._properties = info.properties;
	}
	
	Player.prototype.id = function () {
		return this._id;
	};
	
	Player.prototype.name = function () {
		return this._name;
	};
	
	Player.prototype.money = function () {
		return this._money;
	};
	
	Player.prototype.position = function () {
		return this._position;
	};
	
	Player.prototype.color = function () {
		return this._color;
	};
	
	Player.prototype.type = function () {
		return this._type;
	};
	
	Player.prototype.properties = function () {
		return this._properties.slice();
	};
	
	Player.prototype.move = function (dice, squareCount) {
		precondition(_.isArray(dice) && dice.length === 2 && _.isNumber(dice[0]) && _.isNumber(dice[1]),
			'Moving a player requires a dice with two numbers');
		
		return newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money(),
			position: (this.position() + dice[0] + dice[1]) % squareCount,
			color: this.color(),
			type: this.type(),
			properties: this.properties()
		});
	};
	
	Player.prototype.buyProperty = function (id, price) {
		precondition(_.isNumber(price) && this.money() > price,
			'Buying a property requires the player to have enough money');
		
		return newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money() - price,
			position: this.position(),
			color: this.color(),
			type: this.type(),
			properties: this.properties().concat([id])
		});
	};
}());