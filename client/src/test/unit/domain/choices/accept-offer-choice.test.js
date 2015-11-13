(function() {
	"use strict";
	
	var AcceptOfferChoice = require('./accept-offer-choice');
	var TradeOffer = require('./trade-offer');
	
	var games = require('./sample-games');
	
	describe('An AcceptOffer Choice', function () {
		var choice;
		var state;
		var offer;
		
		beforeEach(function () {
			state = games.turnStartWithSomePropertiesOwned();
			offer = TradeOffer.newOffer([
				{
					player: state.players()[1],
					properties: [state.players()[1].properties()[0].id()],
					money: 1
				},
				{
					player: state.players()[0],
					properties: [state.players()[0].properties()[0].id()],
					money: 2
				}
			]);
			choice = AcceptOfferChoice.newChoice(offer);
		});
		
		it('does not require dice', function () {
			expect(choice.requiresDice()).to.be(false);
		});
		
		describe('when computing next state', function () {
			var nextState;
			
			beforeEach(function () {
				nextState = choice.computeNextState(state);
			});
			
			it('current player becomes offer current player', function () {
				expect(nextState.currentPlayer().id()).to.eql(offer.currentPlayerId());
			});
			
			it('current player lost the money he offered and gained the money the other offered', function () {
				var newMoney = state.players()[1].money() - offer.moneyFor(0) + offer.moneyFor(1);
				
				expect(nextState.currentPlayer().money()).to.eql(newMoney);
			});
			
			it('current player lost the properties he offered and gained the properties the other offered',
				function () {
					var newProperties = addProperties(
						substractProperties(state.players()[1].properties(), offer.propertiesFor(0)),
						offer.propertiesFor(1));
					
					expect(sameProperties(nextState.currentPlayer().properties(), newProperties)).to.be(true);
			});
			
			it('other lost the money he offered and gained the money the current player offered', function () {
				var newMoney = state.players()[0].money() - offer.moneyFor(1) + offer.moneyFor(0);
				
				expect(nextState.players()[0].money()).to.eql(newMoney);
			});
			
			it('other lost the properties he offered and gained the properties the current player offered',
				function () {
					var newProperties = addProperties(
						substractProperties(state.players()[0].properties(), offer.propertiesFor(1)),
						offer.propertiesFor(0));
					
					expect(sameProperties(nextState.players()[0].properties(), newProperties)).to.be(true);
			});
			
			function substractProperties(properties, toSubstract) {
				return _.reduce(toSubstract, function (newProperties, propertyToSubstract) {
					return _.filter(properties, function (property) {
						return property.id() !== propertyToSubstract.id();
					});
				}, properties);
			}
			
			function addProperties(properties, propertiesToAdd) {
				return properties.concat(propertiesToAdd);
			}
			
			function sameProperties(left, right) {
				if (left.length !== right.length) {
					return false;
				}
				
				return _.every(left, function (property, index) {
					return property.id() === right[index].id();
				});
			}
		});
	});
}());