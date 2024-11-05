(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var GameState = require('./game-state');
	var Choices = require('./choices');
	
	exports.newFlatTax = function (amount) {
		precondition(_.isNumber(amount) && amount > 0, 'A PayFlatTaxChoice requires a tax greater than 0');
		
		var name = i18n.CHOOSE_FLAT_TAX.replace('{amount}', i18n.formatPrice(amount));
		return new ChooseTaxTypeChoice(amount, name);
	};
	
	exports.newPercentageTax = function (percentage, amount) {
		precondition(_.isNumber(percentage) && percentage >= 1 && percentage < 100,
			'A PayPercentageTaxChoice requires a percentage between 1 and 100');
		precondition(_.isNumber(amount) && amount > 0,
			'A PayPercentageTaxChoice requires an amount greater than 0 from which to calculate the percentage');
			
		var name = i18n.CHOOSE_PERCENTAGE_TAX.replace('{percentage}', percentage);
		return new ChooseTaxTypeChoice(Math.round(amount * (percentage/100)), name);
	};
	
	function ChooseTaxTypeChoice(amount, name) {
		this.id = 'choose-tax-type';
		this.name = name;
		this._amount = amount;
	}
	
	ChooseTaxTypeChoice.prototype.equals = function (other) {
		if (!(other instanceof ChooseTaxTypeChoice)) {
			return false;
		}
		
		return this._amount === other._amount;
	};
	
	ChooseTaxTypeChoice.prototype.requiresDice = function () {
		return false;
	};
	
	ChooseTaxTypeChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'ChooseTaxTypeChoice requires a game state to compute the next one');
		
		var currentPlayer = state.currentPlayer();
		
		return state.changeChoices(Choices.taxChoices(this._amount, currentPlayer));
	};
}());