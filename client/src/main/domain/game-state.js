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
			'estate': choicesForProperty(square, players, currentPlayer, paid),
			'railroad': choicesForProperty(square, players, currentPlayer, paid),
			'company': choicesForProperty(square, players, currentPlayer, paid),
			'luxury-tax': payLuxuryTax(currentPlayer, paid),
			'income-tax': payIncomeTax(currentPlayer, paid),
			_: onlyFinishTurn
		});
	}
	
	function payLuxuryTax(currentPlayer, paid) {
		return function () {
			if (!paid) {
				if (currentPlayer.money() < 75) {
					return [Choices.goBankrupt()];
				}

				return [Choices.payTax(75)];
			}
			
			return [Choices.finishTurn()];
		};
	}
	
	function payIncomeTax(currentPlayer, paid) {
		return function () {
			if (!paid) {
				return [Choices.chooseFlatTax(200), Choices.choosePercentageTax(10, currentPlayer.netWorth())];
			}
			
			return [Choices.finishTurn()];
		};
	}
	
	function onlyFinishTurn() {
		return [Choices.finishTurn()];
	}
	
	function choicesForProperty(square, players, currentPlayer, paid) {
		return function (id, name, price) {
			var owner = getOwner(players, square);
			
			if (!paid && owner && owner.id() !== currentPlayer.id()) {
				var rent = square.rent(owner.properties());
				if (currentPlayer.money() <= rent) {
					return [Choices.goBankrupt()];
				}
				
				return [Choices.payRent(rent, owner)];
			}
			
			if (!owner && currentPlayer.money() > price) {
				return [Choices.buyProperty(square), Choices.finishTurn()];
			}
			
			return [Choices.finishTurn()];
		};
	}
	
	function getOwner(players, square) {
		return _.find(players, function (player) {
			return _.some(player.properties(), function (property) {
				return property.equals(square);
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
}());