(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var Property = require('./property');
	var GameState = require('./game-state');
	
	exports.newChoice = function (property) {
		precondition(Property.isProperty(property), 'Buy property choice requires a property');
		
		return new BuyPropertyChoice(property);
	};
	
	function BuyPropertyChoice(property) {
		this.id = 'buy-property';
		this.name = i18n.CHOICE_BUY_PROPERTY.replace('{property}', property.name())
			.replace('{price}', i18n.formatPrice(property.price()));
		this._property = property;
	}
	
	BuyPropertyChoice.prototype.equals = function (other) {
		if (!(other instanceof BuyPropertyChoice)) {
			return false;
		}
		
		return this._property.equals(other._property);
	};
	
	BuyPropertyChoice.prototype.requiresDice = function () {
		return false;
	};
	
	BuyPropertyChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'BuyPropertyChoice requires a game state to compute the next one');
			
		return transferOwnership(state, this._property);
	};
	
	function transferOwnership(state, property) {
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return player.buyProperty(property);
			}
			
			return player;
		});
		
		return GameState.turnEndState({
			board: state.board(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex()
		});
	}
}());