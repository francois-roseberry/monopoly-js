(function() {
	"use strict";
	
	var PlayerColors = require('./player-colors').colors();
	var Property = require('./property');
	
	var precondition = require('./contract').precondition;
	var i18n = require('./i18n').i18n();
	
	exports.isPlayer = function (candidate) {
		return candidate instanceof Player;
	};
	
	exports.newPlayers = function (playerConfigurations, boardParameters) {
		precondition(_.isArray(playerConfigurations) && playerConfigurations.length >= 3,
			'Creating players require at least 3 player configurations');
		precondition(_.isNumber(boardParameters.startMoney) && boardParameters.startMoney,
			'Creating players require an amount of money each player starts with');
		precondition(_.isNumber(boardParameters.boardSize) && boardParameters.boardSize > 0,
			'Creating players require a board size');
		precondition(_.isNumber(boardParameters.salary) && boardParameters.salary > 0,
			'Creating players require the salary players get when lapping the board');
		precondition(_.isNumber(boardParameters.jailPosition) && boardParameters.jailPosition,
			'Creating players require a jail position');
		
		return _.map(playerConfigurations, function (playerConfiguration, index) {
			return newPlayer({
				id: 'player' + index,
				name: i18n.DEFAULT_PLAYER_NAME.replace('{index}', index + 1),
				money: boardParameters.startMoney,
				position: 0,
				color: PlayerColors[index],
				type: playerConfiguration.type,
				properties: [],
				boardParameters: boardParameters
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
		precondition(info.boardParameters, 'Player requires board parameters');
		
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
		this._jailed = false;
		this._boardParameters = info.boardParameters;
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
	
	Player.prototype.jailed = function () {
		return this._jailed;
	};
	
	Player.prototype.equals = function (other) {
		precondition(other, 'Testing a player for equality with something else requires that something else');
		
		if (this === other) {
			return true;
		}
		
		if (!(other instanceof Player)) {
			return false;
		}
		
		if (this._id !== other._id) {
			return false;
		}
		
		if (this._name !== other._name) {
			return false;
		}
		
		if (this._money !== other._money) {
			return false;
		}
		
		if (this._position !== other._position) {
			return false;
		}
		
		if (this._color !== other._color) {
			return false;
		}
		
		if (this._type !== other._type) {
			return false;
		}
		
		if (this._jailed !== other._jailed) {
			return false;
		}
		
		return sameProperties(this._properties, other._properties);
	};
	
	function sameProperties(left, right) {
		if (left.length !== right.length) {
			return false;
		}
		
		return _.every(left, function (property, index) {
			return property.id() === right[index].id();
		});
	}
	
	/**
	 * Calculates the net worth of the player (i.e. money + owned properties values).
	 */
	Player.prototype.netWorth = function () {
		var valueOfProperties = _.reduce(this._properties, function (total, property) {
			return total + property.price();
		}, 0);
		
		return this.money() + valueOfProperties;
	};
	
	Player.prototype.move = function (dice) {
		precondition(_.isArray(dice) && dice.length === 2 && _.isNumber(dice[0]) && _.isNumber(dice[1]),
			'Moving a player requires a dice with two numbers');
			
		var squareCount = this._boardParameters.boardSize;
		var newPosition = this.position() + dice[0] + dice[1];
		
		return newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money() + (newPosition >= squareCount ? this._boardParameters.salary : 0),
			position: newPosition % squareCount,
			color: this.color(),
			type: this.type(),
			properties: this.properties(),
			boardParameters: this._boardParameters
		});
	};
	
	Player.prototype.jail = function () {
		var player = newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money(),
			position: this._boardParameters.jailPosition,
			color: this.color(),
			type: this.type(),
			properties: this.properties(),
			boardParameters: this._boardParameters
		});
		
		player._jailed = true;
		
		return player;
	};
	
	Player.prototype.unjail = function () {
		var player = newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money(),
			position: this.position(),
			color: this.color(),
			type: this.type(),
			properties: this.properties(),
			boardParameters: this._boardParameters
		});
		
		player._jailed = false;
		
		return player;
	};
	
	Player.prototype.buyProperty = function (property) {
		precondition(property && Property.isProperty(property), 'Player buying property requires a property');
		
		var alreadyOwned = !!_.find(this.properties(), function (ownedProperty) {
			return ownedProperty.id() === property.id();
		});
		
		precondition(!alreadyOwned, 'Player cannot buy a property he already owns');
		
		return newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money() - property.price(),
			position: this.position(),
			color: this.color(),
			type: this.type(),
			properties: insertProperty(property, this.properties()),
			boardParameters: this._boardParameters
		});
	};
	
	function insertProperty(property, properties) {
		return insertPropertyAt(property, 0, properties);
	}
	
	function insertPropertyAt(property, index, properties) {
		if (index === properties.length) {
			return properties.concat([property]);
		}
		
		var otherProperty = properties[index];
		
		if (property.compareTo(otherProperty) === 1) {
			// It comes before, so insert it at index
			var newProperties = properties.slice();
			newProperties.splice(index, 0, property);
			return newProperties;
		}
		
		// It comes after, so look further in the array
		return insertPropertyAt(property, index + 1, properties);
	}
	
	Player.prototype.gainProperty = function (property) {
		precondition(property && Property.isProperty(property), 'Player gaining property requires a property');
		
		var alreadyOwned = !!_.find(this.properties(), function (ownedProperty) {
			return ownedProperty.id() === property.id();
		});
		
		precondition(!alreadyOwned, 'Player cannot gain a property he already owns');
		
		return newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money(),
			position: this.position(),
			color: this.color(),
			type: this.type(),
			properties: insertProperty(property, this.properties()),
			boardParameters: this._boardParameters
		});
	};
	
	Player.prototype.loseProperty = function (property) {
		precondition(property && Property.isProperty(property), 'Player losing property requires a property');
		
		var alreadyOwned = !!_.find(this.properties(), function (ownedProperty) {
			return ownedProperty.id() === property.id();
		});
		
		precondition(alreadyOwned, 'Player cannot lose a property he does not already owns');
		
		return newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money(),
			position: this.position(),
			color: this.color(),
			type: this.type(),
			properties: _.filter(this.properties(), function (ownedProperty) {
				return ownedProperty.id() !== property.id();
			}),
			boardParameters: this._boardParameters
		});
	};
	
	Player.prototype.pay = function (amount) {
		precondition(_.isNumber(amount) && amount >= 0,
			'Player requires an amount to pay, that is greater than or equal to 0');
			
		precondition(this.money() > amount, 'Player does not have enough money to pay ' + amount);
		
		return playerWithAdditionalMoney(this, -amount);
	};
	
	Player.prototype.earn = function (amount) {
		precondition(_.isNumber(amount) && amount >= 0,
			'Player requires an amount to earn, that is greater than or equal to 0');
		
		return playerWithAdditionalMoney(this, amount);
	};
	
	function playerWithAdditionalMoney(player, amount) {
		return newPlayer({
			id: player.id(),
			name: player.name(),
			money: player.money() + amount,
			position: player.position(),
			color: player.color(),
			type: player.type(),
			properties: player.properties(),
			boardParameters: player._boardParameters
		});
	}
}());