(function() {
	"use strict";
	
	exports.CONFIGURE_GAME_TITLE = 'Monopoly - game configuration';
	exports.COMPUTER_PLAYERS_LABEL = 'Computer players';
	
	// Buttons
	exports.BUTTON_NEW_GAME = 'New game';
	exports.BUTTON_START_GAME = 'Start game';
	
	// Choices
	exports.CHOICE_ROLL_DICE = 'Roll the dice';
	exports.CHOICE_FINISH_TURN = 'Finish turn';
	exports.CHOICE_BUY_PROPERTY = 'Buy {property} for {price}';
	
	// Log messages
	exports.LOG_DICE_ROLL = '{player} rolled a {die1} and a {die2}';
	exports.LOG_DOUBLE_DICE_ROLL = '{player} rolled a double of {dice}';
	
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
	
	exports.PROPERTY_MED = 'Mediterranean Avenue';
	exports.PROPERTY_BALTIC = 'Baltic Avenue';
	exports.PROPERTY_EAST = "Oriental Avenue";
	exports.PROPERTY_VT = 'Vermont Avenue';
	exports.PROPERTY_CONN = 'Connecticut Avenue';
	exports.PROPERTY_CHARLES = 'St.Charles Place';
	exports.PROPERTY_US = 'States Avenue';
	exports.PROPERTY_VN = 'Virginia Avenue';
	exports.PROPERTY_JACK = 'St.James Place';
	exports.PROPERTY_TN = 'Tennessee Avenue';
	exports.PROPERTY_NY = 'New York Avenue';
	exports.PROPERTY_KT = 'Kentucky Avenue';
	exports.PROPERTY_IN = 'Indiana Avenue';
	exports.PROPERTY_IL = 'Illinois Avenue';
	exports.PROPERTY_AT = 'Atlantic Avenue';
	exports.PROPERTY_VR = 'Ventnor Avenue';
	exports.PROPERTY_MARVIN = 'Marvin Gardens';
	exports.PROPERTY_PA = 'Pacific Avenue';
	exports.PROPERTY_NC = 'North Carolina Avenue';
	exports.PROPERTY_PENN = 'Pennsylvania Avenue';
	exports.PROPERTY_PK = 'Park Place';
	exports.PROPERTY_BW = 'Boardwalk';
	
	// Player name
	exports.DEFAULT_PLAYER_NAME = 'Player {index}';
	
	// Price formatting
	exports.PRICE_STRING = 'PRICE {price}';
	exports.formatPrice = function (price) {
		return '$' + price;
	};
}());