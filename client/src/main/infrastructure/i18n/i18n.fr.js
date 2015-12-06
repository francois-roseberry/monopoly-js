(function() {
	"use strict";
	
	exports.CONFIGURE_GAME_TITLE = 'Monopoly - configuration de partie';
	
	// Buttons
	exports.BUTTON_NEW_GAME = 'Nouvelle partie';
	exports.BUTTON_START_GAME = 'Commencer la partie';
	exports.BUTTON_ADD_PLAYER = 'Cliquez ici pour ajouter un joueur';
	
	// Choices
	exports.CHOICE_ROLL_DICE = 'Lancer les dés';
	exports.CHOICE_FINISH_TURN = 'Terminer le tour';
	exports.CHOICE_BUY_PROPERTY = 'Acheter {property} pour {price}';
	exports.CHOICE_PAY_RENT = 'Payer {rent} à {toPlayer}';
	exports.CHOICE_GO_BANKRUPT = 'Faire faillite';
	exports.CHOICE_PAY_TAX = 'Payer une taxe de {amount}';
	exports.CHOOSE_FLAT_TAX = 'Choisir une taxe fixe de {amount}';
	exports.CHOOSE_PERCENTAGE_TAX = 'Choisir une taxe de {percentage}%';
	exports.CHOICE_CALCULATE_DICE_RENT = 'Lancer les dés et payer un loyer de {multiplier} fois le résultat';
	exports.CHOICE_TRADE = "Échanger avec {player}";
	exports.TRADE_MAKE_OFFER = "Faire cette offre";
	exports.TRADE_CANCEL = "Annuler l'échange";
	exports.CHOICE_ACCEPT_OFFER = "Accepter l'offre";
	exports.CHOICE_REJECT_OFFER = "Rejeter l'offre";
	exports.CHOICE_GO_TO_JAIL = "Aller en prison";
	exports.CHOICE_PAY_DEPOSIT = "Payer une caution de {money} pour sortir de prison";
	exports.CHOICE_TRY_DOUBLE_ROLL = "Tenter d'obtenir un doublé pour sortir de prison";
	
	// Log messages
	exports.LOG_DICE_ROLL = '{player} a obtenu un {die1} et un {die2}';
	exports.LOG_DOUBLE_DICE_ROLL = '{player} a obtenu un doublé de {dice}';
	exports.LOG_PROPERTY_BOUGHT = '{player} a acheté {property}';
	exports.LOG_RENT_PAID = '{fromPlayer} a payé {amount} à {toPlayer}';
	exports.LOG_SALARY = "{player} a passé GO et reçu $200";
	exports.LOG_TAX_PAID = "{player} a payé une taxe de {amount}";
	exports.LOG_OFFER_MADE = "{player1} a offert à {player2} : {offer1} pour {offer2}";
	exports.LOG_OFFER_ACCEPTED = "L'offre a été acceptée";
	exports.LOG_CONJUNCTION = 'et';
	exports.LOG_OFFER_REJECTED = "L'offre a été rejetée";
	exports.LOG_GONE_TO_JAIL = "{player} vient d'aller en prison";
	exports.LOG_GONE_BANKRUPT = "{player} a fait faillite";
	exports.LOG_GAME_WON = "{player} a gagné la partie";
	
	// Squares
	exports.CHANCE = 'Chance';
	exports.COMMUNITY_CHEST = 'Caisse commune';
	exports.INCOME_TAX = 'Impôt sur le revenu';
	exports.LUXURY_TAX = 'Taxe de luxe';
	exports.LUXURY_TAX_DESCRIPTION = "Payez 75 $";
	exports.INCOME_TAX_DESCRIPTION = "Payez 10% ou 200 $";
	exports.START_DESCRIPTION = "Réclamez 200 $ de salaire en passant à";
	exports.VISITING_JAIL = "En visite";
	exports.FREE_PARKING = "Stationnement gratuit";
	exports.GO_TO_JAIL = "Allez en prison";
	
	exports.COMPANY_WATER = 'Aqueduc';
	exports.COMPANY_ELECTRIC = "Compagnie d'électricité";
	
	exports.RAILROAD_READING = 'Chemin de fer Reading';
	exports.RAILROAD_PENN = 'Chemin de fer Pennsylvanie';
	exports.RAILROAD_B_O = 'Chemin de fer B.& O.';
	exports.RAILROAD_SHORT = 'Chemin de fer Petit Réseau';
	
	exports.PROPERTY_MD = 'Avenue de la Méditerrannée';
	exports.PROPERTY_BT = 'Avenue de la Baltique';
	exports.PROPERTY_ET = "Avenue de l'Orient";
	exports.PROPERTY_VT = 'Avenue Vermont';
	exports.PROPERTY_CN = 'Avenue Connecticut';
	exports.PROPERTY_CL = 'Place St-Charles';
	exports.PROPERTY_US = 'Avenue des États-Unis';
	exports.PROPERTY_VN = 'Avenue Virginie';
	exports.PROPERTY_JK = 'Place St-Jacques';
	exports.PROPERTY_TN = 'Avenue Tennessee';
	exports.PROPERTY_NY = 'Avenue New York';
	exports.PROPERTY_KT = 'Avenue Kentucky';
	exports.PROPERTY_IN = 'Avenue Indiana';
	exports.PROPERTY_IL = 'Avenue Illinois';
	exports.PROPERTY_AT = 'Avenue Atlantique';
	exports.PROPERTY_VR = 'Avenue Ventnor';
	exports.PROPERTY_MN = 'Jardins Marvin';
	exports.PROPERTY_PA = 'Avenue Pacifique';
	exports.PROPERTY_NC = 'Avenue Caroline du Nord';
	exports.PROPERTY_PN = 'Avenue Pennsylvanie';
	exports.PROPERTY_PK = 'Place du parc';
	exports.PROPERTY_BW = 'Promenade';
	
	// Player name
	exports.DEFAULT_PLAYER_NAME = 'Joueur {index}';
	
	// Player types
	exports.PLAYER_TYPE_HUMAN = 'Humain';
	exports.PLAYER_TYPE_COMPUTER = 'Ordinateur';
	
	// Price formatting
	exports.PRICE_STRING = 'Prix {price}';
	exports.formatPrice = function (price) {
		return price + ' $';
	};
	
	// Trade
	exports.TRADE_TITLE = "Échange";
}());