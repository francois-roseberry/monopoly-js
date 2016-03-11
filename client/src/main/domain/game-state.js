(function() {
	"use strict";
	
	var Board = require('./board');
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
	var PayDepositChoice = require('./pay-deposit-choice');
	var TryDoubleRollChoice = require('./try-double-roll-choice');
	
	var precondition = require('./contract').precondition;
	
	exports.isGameState = function (candidate) {
		return candidate instanceof GameState;
	};
	
	exports.gameInTradeState = function (board, players, offer) {
		precondition(Board.isBoard(board),
			'GameInTradeState requires a board');
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
			board: board,
			players: players,
			currentPlayerIndex: otherPlayerIndex
		}, choices);
		
		state.offer = function () {
			return offer;
		};
		
		return state;
	};
	
	exports.gameFinishedState = function (board, winner) {
		precondition(Board.isBoard(board),
			'GameFinishedState requires a board');
		precondition(winner, 'GameFinishedState requires a winner');
		
		return new GameState({
			board: board,
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
		if (info.players[info.currentPlayerIndex].jailed()) {
			if (info.players[info.currentPlayerIndex].money() > info.board.jailBailout()) {
				return [PayDepositChoice.newChoice(info.board.jailBailout()), TryDoubleRollChoice.newChoice()];
			}
			
			return [TryDoubleRollChoice.newChoice()];
		}
			
		var tradeChoices = _.filter(info.players, function (player, index) {
				return index !== info.currentPlayerIndex;
			})
			.map(function (player) {
				return TradeChoice.newChoice(player);
			});
			
		return [MoveChoice.newChoice()].concat(tradeChoices);
	}
	
	exports.turnEndState = function (info) {
		validateInfo(info);
			
		var choices = turnEndChoices(info);
		
		return new GameState(info, choices);
	};
	
	exports.turnEndStateAfterPay = function (info) {
		validateInfo(info);
		
		return new GameState(info, [FinishTurnChoice.newChoice()]);
	};
	
	function turnEndChoices(info) {
		var currentPlayer = info.players[info.currentPlayerIndex];
		var currentSquare = info.board.squares()[currentPlayer.position()];
		var choices = choicesForSquare(currentSquare, info.players, currentPlayer);
			
		return choices;
	}
	
	function choicesForSquare(square, players, currentPlayer) {
		return square.match({
			'estate': choicesForProperty(square, players, currentPlayer),
			'railroad': choicesForProperty(square, players, currentPlayer),
			'company': choicesForProperty(square, players, currentPlayer),
			'luxury-tax': payLuxuryTax(currentPlayer),
			'income-tax': payIncomeTax(currentPlayer),
			'go-to-jail': goToJail,
			_: onlyFinishTurn
		});
	}
	
	function goToJail() {
		return [GoToJailChoice.newChoice()];
	}
	
	function payLuxuryTax(currentPlayer) {
		return function (_, amount) {
			return Choices.taxChoices(amount, currentPlayer);
		};
	}
	
	function payIncomeTax(currentPlayer) {
		return function (_, percentageTax, flatTax) {
			return [
				ChooseTaxTypeChoice.newPercentageTax(percentageTax, currentPlayer.netWorth()),
				ChooseTaxTypeChoice.newFlatTax(flatTax)
			];
		};
	}
	
	function onlyFinishTurn() {
		return [FinishTurnChoice.newChoice()];
	}
	
	function choicesForProperty(square, players, currentPlayer) {
		return function (id, name, price) {
			var owner = getOwner(players, square);
			
			if (owner && owner.id() !== currentPlayer.id()) {
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
		precondition(Board.isBoard(info.board),
			'GameState requires a board');
		precondition(_.isArray(info.players) && info.players.length >= 2,
			'GameState requires an array of at least 2 players');
		precondition(_.isNumber(info.currentPlayerIndex) && validIndex(info.players, info.currentPlayerIndex),
			'GameState requires the index of the current player');
	}
	
	function validIndex(array, index) {
		return index >= 0 && index < array.length;
	}
	
	function GameState(info, choices) {
		this._board = info.board;
		this._players = info.players;
		this._currentPlayerIndex = info.currentPlayerIndex;
		this._choices = choices;
	}
	
	GameState.prototype.board = function () {
		return this._board;
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
		
		if (!(this._board.equals(other._board))) {
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
			board: this._board,
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
			board: this._board,
			players: this._players,
			currentPlayerIndex: this._currentPlayerIndex
		}, this._oldChoices);
	};
}());