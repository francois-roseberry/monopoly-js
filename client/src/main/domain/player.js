(function() {
	"use strict";
	
	var PlayerColors = require('./player-colors').colors();
	
	var precondition = require('./contract').precondition;
	
	exports.newPlayers = function (playerConfigurations) {
		return _.map(playerConfigurations, function (playerConfiguration, index) {
			return newPlayer({
				name: 'Joueur ' + (index + 1),
				money: 1500,
				position: 0,
				color: PlayerColors[index],
				type: playerConfiguration.type
			});
		});
	};
	
	function newPlayer (info) {
		precondition(_.isString(info.name) && info.name !== '', 'Player requires a name');
		precondition(_.isNumber(info.money) && info.money >= 0, 'Player requires an amount of money');
		precondition(_.isNumber(info.position) && info.position >= 0, 'Player requires a position');
		precondition(_.isString(info.color) && info.color !== '', 'Player requires a color');
		precondition(_.isString(info.type) && validPlayerType(info.type), 'Player requires a valid type');
		
		return new Player(info);
	}
	
	function validPlayerType(type) {
		return type === 'human' || type === 'computer';
	}
	
	function Player(info) {
		this._name = info.name;
		this._money = info.money;
		this._position = info.position;
		this._color = info.color;
		this._type = info.type;
	}
	
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
	
	Player.prototype.move = function(dice, squareCount) {
		return newPlayer({
					name: this.name(),
					money: this.money(),
					position: (this.position() + dice[0] + dice[1]) % squareCount,
					color: this.color(),
					type: this.type()
				});
	};
}());