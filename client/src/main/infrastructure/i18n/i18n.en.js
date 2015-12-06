(function() {
	"use strict";
	
	exports.CONFIGURE_GAME_TITLE = 'Monopoly - game configuration';
	
	// Buttons
	exports.BUTTON_NEW_GAME = 'New game';
	exports.BUTTON_START_GAME = 'Start game';
	exports.BUTTON_ADD_PLAYER = 'Click here to add a player';
	
	// Choices
	exports.CHOICE_ROLL_DICE = 'Roll the dice';
	exports.CHOICE_FINISH_TURN = 'Finish turn';
	exports.CHOICE_BUY_PROPERTY = 'Buy {property} for {price}';
	exports.CHOICE_PAY_RENT = 'Pay {rent} to {toPlayer}';
	exports.CHOICE_GO_BANKRUPT = 'Go bankrupt';
	exports.CHOICE_PAY_TAX = 'Pay a {amount} tax';
	exports.CHOOSE_FLAT_TAX = 'Choose a flat {amount} tax';
	exports.CHOOSE_PERCENTAGE_TAX = 'Choose a {percentage}% tax';
	exports.CHOICE_CALCULATE_DICE_RENT = 'Roll the dice and pay a rent of {multiplier} times the result';
	exports.CHOICE_TRADE = "Trade with {player}";
	exports.TRADE_MAKE_OFFER = "Make this offer";
	exports.TRADE_CANCEL = "Cancel trade";
	exports.CHOICE_ACCEPT_OFFER = "Accept offer";
	exports.CHOICE_REJECT_OFFER = "Reject offer";
	exports.CHOICE_GO_TO_JAIL = "Go to jail";
	exports.CHOICE_PAY_DEPOSIT = "Pay a {money} deposit to get out of jail";
	exports.CHOICE_TRY_DOUBLE_ROLL = "Try to roll a double to get out of jail";
	
	// Log messages
	exports.LOG_DICE_ROLL = '{player} rolled a {die1} and a {die2}';
	exports.LOG_DOUBLE_DICE_ROLL = '{player} rolled a double of {dice}';
	exports.LOG_PROPERTY_BOUGHT = '{player} bought {property}';
	exports.LOG_RENT_PAID = '{fromPlayer} paid {amount} to {toPlayer}';
	exports.LOG_SALARY = "{player} passed GO and received $200";
	exports.LOG_TAX_PAID = "{player} paid a {amount} tax";
	exports.LOG_OFFER_MADE = "{player1} offered {player2} : {offer1} for {offer2}";
	exports.LOG_OFFER_ACCEPTED = "The offer has been accepted";
	exports.LOG_CONJUNCTION = 'and';
	exports.LOG_OFFER_REJECTED = "The offer has been rejected";
	exports.LOG_GONE_TO_JAIL = "{player} went to jail";
	exports.LOG_GONE_BANKRUPT = "{player} has gone bankrupt";
	exports.LOG_GAME_WON = "{player} has won the game";
	
	// Squares
	exports.CHANCE = 'Chance';
	exports.COMMUNITY_CHEST = 'Community Chest';
	exports.INCOME_TAX = 'Income Tax';
	exports.LUXURY_TAX = 'Luxury Tax';
	exports.LUXURY_TAX_DESCRIPTION = "Pay $75";
	exports.INCOME_TAX_DESCRIPTION = "Pay 10% or $200";
	exports.START_DESCRIPTION = "Collect $200 salary as you pass";
	exports.VISITING_JAIL = "Just visiting";
	exports.FREE_PARKING = "Free parking";
	exports.GO_TO_JAIL = "Go to jail";
	
	exports.COMPANY_WATER = 'Water Works';
	exports.COMPANY_ELECTRIC = "Electric Company";
	
	exports.RAILROAD_READING = 'Reading Railroad';
	exports.RAILROAD_PENN = 'Pennsylvania Railroad';
	exports.RAILROAD_B_O = 'B.& O. Railroad';
	exports.RAILROAD_SHORT = 'Short line';
	
	exports.PROPERTY_MD = 'Mediterranean Avenue';
	exports.PROPERTY_BT = 'Baltic Avenue';
	exports.PROPERTY_ET = "Oriental Avenue";
	exports.PROPERTY_VT = 'Vermont Avenue';
	exports.PROPERTY_CN = 'Connecticut Avenue';
	exports.PROPERTY_CL = 'St.Charles Place';
	exports.PROPERTY_US = 'States Avenue';
	exports.PROPERTY_VN = 'Virginia Avenue';
	exports.PROPERTY_JK = 'St.James Place';
	exports.PROPERTY_TN = 'Tennessee Avenue';
	exports.PROPERTY_NY = 'New York Avenue';
	exports.PROPERTY_KT = 'Kentucky Avenue';
	exports.PROPERTY_IN = 'Indiana Avenue';
	exports.PROPERTY_IL = 'Illinois Avenue';
	exports.PROPERTY_AT = 'Atlantic Avenue';
	exports.PROPERTY_VR = 'Ventnor Avenue';
	exports.PROPERTY_MN = 'Marvin Gardens';
	exports.PROPERTY_PA = 'Pacific Avenue';
	exports.PROPERTY_NC = 'North Carolina Avenue';
	exports.PROPERTY_PN = 'Pennsylvania Avenue';
	exports.PROPERTY_PK = 'Park Place';
	exports.PROPERTY_BW = 'Boardwalk';
	
	// Player name
	exports.DEFAULT_PLAYER_NAME = 'Player {index}';
	
	// Player types
	exports.PLAYER_TYPE_HUMAN = 'Human';
	exports.PLAYER_TYPE_COMPUTER = 'Computer';
	
	// Price formatting
	exports.PRICE_STRING = 'Price {price}';
	exports.formatPrice = function (price) {
		return '$' + price;
	};
	
	// Trade
	exports.TRADE_TITLE = "Trade";
}());