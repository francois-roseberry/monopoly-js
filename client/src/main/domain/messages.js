(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var Player = require('./player');
	var Property = require('./property');
	var TradeOffer = require('./trade-offer');
	
	exports.logDiceRoll = function (player, die1, die2) {
		precondition(Player.isPlayer(player),
			'A log about dice roll requires the name of the player who rolled the dice');
		precondition(_.isNumber(die1) && die1 >= 1 && die1 <= 6,
			'A log about dice roll requires a first die between 1 and 6');
		precondition(_.isNumber(die2) && die2 >= 1 && die2 <= 6,
			'A log about dice roll requires a first die between 1 and 6');
		
		var message = i18n.LOG_DICE_ROLL
					.replace('{player}', coloredPlayer(player))
					.replace('{die1}', die1)
					.replace('{die2}', die2);
						
		return new Log('dice-roll', message);
	};
	
	exports.logDoubleDiceRoll = function (player, dice) {
		precondition(Player.isPlayer(player),
			'A log about double dice roll requires the player who rolled the dice');
		precondition(_.isNumber(dice) && dice,
			'A log about double dice roll requires dice to be greater than 1');
		
		var message = i18n.LOG_DOUBLE_DICE_ROLL
						.replace('{player}', coloredPlayer(player))
						.replace('{dice}', dice);
						
		return new Log('double-dice-roll', message);
	};
	
	exports.logPropertyBought = function (player, property) {
		precondition(Player.isPlayer(player),
			'A log about property bought requires the player who bought');
		precondition(Property.isProperty(property),
			'A log about property bought requires the property that was bought');
		
		var message = i18n.LOG_PROPERTY_BOUGHT
						.replace('{player}', coloredPlayer(player))
						.replace('{property}', property.name());
						
		return new Log('property-bought', message);
	};
	
	exports.logRentPaid = function (amount, fromPlayer, toPlayer) {
		precondition(_.isNumber(amount) && amount > 0,
			'A log about rent paid requires an amount greater than 0');
		precondition(Player.isPlayer(fromPlayer),
			'A log about rent paid requires of the player who paid');
		precondition(Player.isPlayer(toPlayer),
			'A log about rent paid requires of the player who received the payment');
		
		var message = i18n.LOG_RENT_PAID
						.replace('{amount}', i18n.formatPrice(amount))
						.replace('{fromPlayer}', coloredPlayer(fromPlayer))
						.replace('{toPlayer}', coloredPlayer(toPlayer));
		
		return new Log('rent-paid', message);
	};
	
	exports.logSalaryReceived = function (player) {
		precondition(Player.isPlayer(player),
			'A log about player salary requires the player');
			
		var message = i18n.LOG_SALARY
						.replace('{player}', coloredPlayer(player));
						
		return new Log('salary-earned', message);
	};
	
	exports.logTaxPaid = function (amount, player) {
		precondition(_.isNumber(amount) && amount > 0,
			'A log about tax paid requires an amount greater than 0');
		precondition(Player.isPlayer(player),
			'A log about tax paid requires the player who paid');
			
		var message = i18n.LOG_TAX_PAID
						.replace('{amount}', i18n.formatPrice(amount))
						.replace('{player}', coloredPlayer(player));
						
		return new Log('tax-paid', message);
	};
	
	exports.logOfferMade = function (player1, player2, offer) {
		precondition(Player.isPlayer(player1),
			'A log about an offer being made requires the first player');
		precondition(Player.isPlayer(player2),
			'A log about an offer being made requires the second player');
		precondition(TradeOffer.isOffer(offer) && !offer.isEmpty(),
			'A log about an offer being made requires that offer');
			
		var message = i18n.LOG_OFFER_MADE
						.replace('{player1}', coloredPlayer(player1))
						.replace('{player2}', coloredPlayer(player2))
						.replace('{offer1}', enumerateOfferFor(offer, 0))
						.replace('{offer2}', enumerateOfferFor(offer, 1));
		
		return new Log('offer-made', message);
	};
	
	function enumerateOfferFor(offer, playerIndex) {
		var propertiesOffer = _.map(offer.propertiesFor(playerIndex), function (property) {
			return property.name();
		})
		.join(', ');
		
		var priceOffer = i18n.formatPrice(offer.moneyFor(playerIndex));
		
		if (propertiesOffer === '') {
			return priceOffer;
		}
		
		return propertiesOffer + ' ' + i18n.LOG_CONJUNCTION + ' ' + priceOffer;
	}
	
	exports.logOfferAccepted = function () {
		return new Log('offer-accepted', i18n.LOG_OFFER_ACCEPTED);
	};
	
	exports.logOfferRejected = function () {
		return new Log('offer-rejected', i18n.LOG_OFFER_REJECTED);
	};
	
	exports.logGoneToJail = function (player) {
		precondition(Player.isPlayer(player),
			'A log about a player going to jail requires that player');
		
		var message = i18n.LOG_GONE_TO_JAIL
						.replace('{player}', coloredPlayer(player));
		
		return new Log('gone-to-jail', message);
	};
	
	exports.logGoneBankrupt = function (player) {
		precondition(Player.isPlayer(player),
			'A log about player going bankrupt requires that player');
			
		var message = i18n.LOG_GONE_BANKRUPT
						.replace('{player}', coloredPlayer(player));
						
		return new Log('gone-bankrupt', message);
	};
	
	exports.logGameWon = function (player) {
		precondition(Player.isPlayer(player),
			'A log about game won requires the winner');
			
		var message = i18n.LOG_GAME_WON
						.replace('{player}', coloredPlayer(player));
						
		return new Log('game-won', message);
	};
	
	exports.simpleLog = function () {
		return new Log('simple', 'A message');
	};
	
	function Log(id, message) {
		this._id = id;
		this._message = message;
	}
	
	Log.prototype.id = function () {
		return this._id;
	};
	
	Log.prototype.message = function () {
		return this._message;
	};
	
	Log.prototype.equals = function (other) {
		return other instanceof Log && this._id === other._id && this._message === other._message;
	};
	
	function coloredPlayer(player) {
		return '<span style="color: ' + player.color() + '; font-weight: bold;">' + player.name() + '</span>';
	}
}());