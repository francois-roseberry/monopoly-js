(function() {
	"use strict";
	
	var Choices = require('./choices');
	
	var precondition = require('./contract').precondition;
	
	exports.gameFinishedState = function (squares, winner) {
		precondition(_.isArray(squares) && squares.length === 40,
			'GameFinishedState requires an array of 40 squares');
		precondition(winner, 'GameFinishedState requires a winner');
		
		return new GameState({
			squares: squares,
			players: [winner],
			currentPlayerIndex: 0
		}, []);
	};
	
	exports.turnStartState = function (info) {
		validateInfo(info);
			
		var choices = newTurnChoices();
		
		return new GameState(info, choices);
	};
	
	function newTurnChoices() {
		return [Choices.rollDice()];
	}
	
	exports.turnEndState = function (info, paid) {
		validateInfo(info);
			
		var choices = turnEndChoices(info, paid || false);
		
		return new GameState(info, choices);
	};
	
	function turnEndChoices(info, paid) {
		var currentPlayer = info.players[info.currentPlayerIndex];
		var currentSquare = info.squares[currentPlayer.position()];
		var choices = choicesForSquare(currentSquare, info.players, currentPlayer, paid);
			
		return choices;
	}
	
	function choicesForSquare(square, players, currentPlayer, paid) {
		return square.match({
			'estate': choicesForProperty(players, currentPlayer, paid, estateRent(square)),
			'railroad': choicesForProperty(players, currentPlayer, paid, railroadRent),
			'company': choicesForProperty(players, currentPlayer, paid, companyRent),
			_: onlyFinishTurn
		});
	}
	
	function onlyFinishTurn() {
		return [Choices.finishTurn()];
	}
	
	function companyRent() {
		return 25;
	}
	
	function estateRent(square) {
		return function () {
			return square.rent();
		};
	}
	
	function railroadRent(ownerProperties) {
		var count = railroadCountIn(ownerProperties);
		return 25 * Math.pow(2, count - 1);
	}
	
	function railroadCountIn(properties) {
		return _.reduce(properties, function (count, property) {
			if (property === 'rr-reading' || property === 'rr-penn' ||
				property === 'rr-bo' || property === 'rr-short') {
				return count + 1;
			}
			
			return count;
		}, 0);
	}
	
	function choicesForProperty(players, currentPlayer, paid, rentFunction) {
		return function (id, name, price) {
			var owner = getOwner(players, id);
			
			if (!paid && owner && owner.id() !== currentPlayer.id()) {
				var rent = rentFunction(owner.properties());
				if (currentPlayer.money() <= rent) {
					return [Choices.goBankrupt()];
				}
				
				return [Choices.payRent(rent, owner.id(), owner.name())];
			}
			
			if (!owner && currentPlayer.money() > price) {
				return [Choices.buyProperty(id, name, price), Choices.finishTurn()];
			}
			
			return [Choices.finishTurn()];
		};
	}
	
	function getOwner(players, propertyId) {
		return _.find(players, function (player) {
			return _.some(player.properties(), function (property) {
				return property === propertyId;
			});
		});
	}
	
	function validateInfo(info) {
		precondition(_.isArray(info.squares) && info.squares.length === 40,
			'GameState requires an array of 40 squares');
		precondition(_.isArray(info.players) && info.players.length >= 2,
			'GameState requires an array of at least 2 players');
		precondition(_.isNumber(info.currentPlayerIndex) && validIndex(info.players, info.currentPlayerIndex),
			'GameState requires the index of the current player');
	}
	
	function validIndex(array, index) {
		return index >= 0 && index < array.length;
	}
	
	function GameState(info, choices) {
		this._squares = info.squares;
		this._players = info.players;
		this._currentPlayerIndex = info.currentPlayerIndex;
		this._choices = choices;
	}
	
	GameState.prototype.squares = function () {
		return this._squares;
	};
	
	GameState.prototype.players = function () {
		return this._players;
	};
	
	GameState.prototype.currentPlayerIndex = function () {
		return this._currentPlayerIndex;
	};
	
	GameState.prototype.choices = function () {
		return this._choices;
	};
	
	GameState.prototype.propertyById = function (propertyId) {
		precondition(_.isString(propertyId) && propertyId.length > 0,
			'Trying to find a property in a game state requires the property id');
		
		var match = _.find(this._squares, function (square) {
			return square.match({
				'estate': function (id) { return id === propertyId; },
				'railroad': function (id) { return id === propertyId; },
				'company': function (id) { return id === propertyId; },
				_: function () { return false; }
			});
		});
		
		if (match === null) {
			throw new Error('Could not find property with id : ' + propertyId);
		}
		
		return match;
	};
}());