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
	
	// Log messages
	exports.LOG_DICE_ROLL = '{player} rolled a {die1} and a {die2}';
	exports.LOG_DOUBLE_DICE_ROLL = '{player} rolled a double of {dice}';
	exports.LOG_PROPERTY_BOUGHT = '{player} bought {property}';
	exports.LOG_RENT_PAID = '{fromPlayer} paid {amount} to {toPlayer}';
	exports.LOG_SALARY = "{player} passed GO and received $200";
	exports.LOG_TAX_PAID = "{player} paid a {amount} tax";
	
	// Squares
	exports.CHANCE = 'Chance';
	exports.COMMUNITY_CHEST = 'Community Chest';
	exports.INCOME_TAX = 'Income Tax';
	exports.LUXURY_TAX = 'Luxury Tax';
	
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
	exports.PRICE_STRING = 'PRICE {price}';
	exports.formatPrice = function (price) {
		return '$' + price;
	};
}());