(function() {
	"use strict";
	
	var Choices = require('./choices');
	var MoveChoice = require('./move-choice');
	var FinishTurnChoice = require('./finish-turn-choice');
	var BuyPropertyChoice = require('./buy-property-choice');
	var ChooseTaxTypeChoice = require('./choose-tax-type-choice');
	var CalculateDiceRentChoice = require('./calculate-dice-rent-choice');
	var TradeChoice = require('./trade-choice');
	var AcceptOfferChoice = require('./accept-offer-choice');
	var RejectOfferChoice = require('./reject-offer-choice');
	var TradeOffer = require('./trade-offer');
	var GoToJailChoice = require('./go-to-jail-choice');
	
	var precondition = require('./contract').precondition;
	
	exports.isGameState = function (candidate) {
		return candidate instanceof GameState;
	};
	
	exports.gameInTradeState = function (squares, players, offer) {
		precondition(_.isArray(squares) && squares.length === 40,
			'GameInTradeState requires an array of 40 squares');
		precondition(_.isArray(players),
			'GameInTradeState requires an array of players');
		precondition(TradeOffer.isOffer(offer),
			'GameInTradeState requires an offer');
			
		var otherPlayerIndex = _.findIndex(players, function (player) {
			return player.id() === offer.otherPlayerId();
		});
		
		precondition(otherPlayerIndex >= 0,
			'Offer must be destined to an existing player');
		
		var choices = [
			AcceptOfferChoice.newChoice(offer),
			RejectOfferChoice.newChoice(offer.currentPlayerId())
		];
		
		var state = new GameState({
			squares: squares,
			players: players,
			currentPlayerIndex: otherPlayerIndex
		}, choices);
		
		state.offer = function () {
			return offer;
		};
		
		return state;
	};
	
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
			
		var choices = newTurnChoices(info);
		
		return new GameState(info, choices);
	};
	
	function newTurnChoices(info) {
		var tradeChoices = _.filter(info.players, function (player, index) {
				return index !== info.currentPlayerIndex;
			})
			.map(function (player) {
				return TradeChoice.newChoice(player);
			});
			
		return [MoveChoice.newChoice()].concat(tradeChoices);
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
			'go-to-jail': goToJail,
			_: onlyFinishTurn
		});
	}
	
	function goToJail() {
		return [GoToJailChoice.newChoice()];
	}
	
	function payLuxuryTax(currentPlayer, paid) {
		return function () {
			if (!paid) {
				return Choices.taxChoices(75, currentPlayer);
			}
			
			return [FinishTurnChoice.newChoice()];
		};
	}
	
	function payIncomeTax(currentPlayer, paid) {
		return function () {
			if (!paid) {
				return [
					ChooseTaxTypeChoice.newPercentageTax(10, currentPlayer.netWorth()),
					ChooseTaxTypeChoice.newFlatTax(200)
				];
			}
			
			return [FinishTurnChoice.newChoice()];
		};
	}
	
	function onlyFinishTurn() {
		return [FinishTurnChoice.newChoice()];
	}
	
	function choicesForProperty(square, players, currentPlayer, paid) {
		return function (id, name, price) {
			var owner = getOwner(players, square);
			
			if (!paid && owner && owner.id() !== currentPlayer.id()) {
				var rent = square.rent(owner.properties());
				if (rent.amount) {
					return Choices.rentChoices(rent.amount, currentPlayer, owner);
				}
				
				return [CalculateDiceRentChoice.newChoice(rent.multiplier, owner)];			
			}
			
			if (!owner && currentPlayer.money() > price) {
				return [BuyPropertyChoice.newChoice(square), FinishTurnChoice.newChoice()];
			}
			
			return [FinishTurnChoice.newChoice()];
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
	
	GameState.prototype.currentPlayer = function () {
		return this._players[this._currentPlayerIndex];
	};
	
	GameState.prototype.currentPlayerIndex = function () {
		return this._currentPlayerIndex;
	};
	
	GameState.prototype.choices = function () {
		return this._choices;
	};
	
	GameState.prototype.equals = function (other) {
		precondition(other, 'Testing a game state for equality with something else requires that something else');
		
		if (this === other) {
			return true;
		}
		
		if (!(other instanceof GameState)) {
			return false;
		}
		
		if (!deepEquals(this._squares, other._squares)) {
			return false;
		}
		
		if (!deepEquals(this._players, other._players)) {
			return false;
		}
		
		if (this._currentPlayerIndex !== other._currentPlayerIndex) {
			return false;
		}
		
		if (!deepEquals(this._choices, other._choices)) {
			return false;
		}
		
		return true;
	};
	
	function deepEquals(left, right) {
		if (left.length !== right.length) {
			return false;
		}
		
		return _.every(left, function (element, index) {
			return element.equals(right[index]);
		});
	}
	
	GameState.prototype.changeChoices = function (choices) {
		precondition(_.isArray(choices), 'Changing a game state choices list requires a list of choices');
		
		var state = new GameState({
			squares: this._squares,
			players: this._players,
			currentPlayerIndex: this._currentPlayerIndex
		}, choices);
		state._oldChoices = this._choices;
		
		return state;
	};
	
	GameState.prototype.restoreChoices = function () {
		precondition(_.isArray(this._oldChoices),
			'Restoring the choices of a game state require a list of choices to restore');
			
		return new GameState({
			squares: this._squares,
			players: this._players,
			currentPlayerIndex: this._currentPlayerIndex
		}, this._oldChoices);
	};
}());