(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var GameState = require('./game-state');
	var TradeOffer = require('./trade-offer');
	
	exports.newChoice = function (offer) {
		precondition(TradeOffer.isOffer(offer), 'An AcceptOfferChoice requires an offer');
		
		return new AcceptOfferChoice(offer);
	};
	
	function AcceptOfferChoice(offer) {
		this.id = 'accept-offer';
		this.name = i18n.CHOICE_ACCEPT_OFFER;
		this._offer = offer;
	}
	
	AcceptOfferChoice.prototype.equals = function (other) {
		if (!(other instanceof AcceptOfferChoice)) {
			return false;
		}
		
		if (!this._offer.equals(other._offer)) {
			return false;
		}
		
		return true;
	};
	
	AcceptOfferChoice.prototype.requiresDice = function () {
		return false;
	};
	
	AcceptOfferChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'AcceptOfferChoice requires a game state to compute the next one');
		
		var self = this;
		var playerIndex = _.findIndex(state.players(), function (player) {
			return player.id() === self._offer.currentPlayerId();
		});
		
		precondition(playerIndex >= 0, 'Offer accepted must have been made by a valid player');
		
		var newPlayers = _.map(state.players(), function (player) {
			if (player.id() === self._offer.currentPlayerId()) {
				return transferPossessionsInOffer(player, self._offer, 0, 1);
			}
			
			if (player.id() === self._offer.otherPlayerId()) {
				return transferPossessionsInOffer(player, self._offer, 1, 0);
			}
			
			return player;
		});
		
		return GameState.turnStartState({
			board: state.board(),
			players: newPlayers,
			currentPlayerIndex: playerIndex
		});
	};
	
	function transferPossessionsInOffer(player, offer, playerIndexFrom, playerIndexTo) {
		var newPlayer = player.pay(offer.moneyFor(playerIndexFrom))
			.earn(offer.moneyFor(playerIndexTo));
		
		newPlayer = _.reduce(offer.propertiesFor(playerIndexFrom), function (newPlayer, property) {
			return newPlayer.loseProperty(property);
		}, newPlayer);
		
		newPlayer = _.reduce(offer.propertiesFor(playerIndexTo), function (newPlayer, property) {
			return newPlayer.gainProperty(property);
		}, newPlayer);
		
		return newPlayer;
	}
}());
},{"./contract":10,"./game-state":16,"./i18n":24,"./trade-offer":45}],2:[function(require,module,exports){
(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	var i18n = require('./i18n').i18n();
	
	var Symbols = require('./symbols');
	var TextWrapper = require('./text-wrapper');
	
	var SQUARE_WIDTH = 78;
	var SQUARE_HEIGHT = 100;
	var SQUARES_PER_ROW = 10;
	
	exports.render = function (container, gameState) {
		precondition(container, 'A Board Widget requires a container to render into');
		precondition(gameState, 'A Board Widget requires an observable of the gameState');
		
		var board = renderBoard(container);
		
		gameState.subscribe(renderSquares(board));
	};
	
	function renderBoard(container) {
		return d3.select(container[0]).append('svg')
			.classed('monopoly-board', true)
			.attr({
				width: 9 * SQUARE_WIDTH + 2 * SQUARE_HEIGHT,
				height: 9 * SQUARE_WIDTH + 2 * SQUARE_HEIGHT
			});
	}
	
	function renderSquares(container) {
		return function (state) {
			var rows = squaresToRows(state.board().squares());
			
			var squares = container.selectAll('.monopoly-row')
				.data(rows)
				.enter()
				.append('g')
				.classed('monopoly-row', true)
				.attr('transform', function (_, index) { return transformForRow(index); })
				.selectAll('.monopoly-square')
				.data(function (row) { return row; })
				.enter()
				.append('g')
				.classed('monopoly-square', true)
				.attr('transform', function (_, index) {
					return 'translate(' + (9 * SQUARE_WIDTH + SQUARE_HEIGHT - SQUARE_WIDTH * index) + ')';
				});
				
			squares
				.append('rect')
				.attr({
					fill: 'white',
					stroke: 'black',
					width: function (_, index) {
						return index === 0 ? SQUARE_HEIGHT : SQUARE_WIDTH;
					},
					height: SQUARE_HEIGHT
				});
				
			squares
				.each(function (square) {
					renderSquare(d3.select(this), square, state.players());
				});
				
			container.selectAll('.monopoly-square')
				.data(state.board().squares())
				.each(function (square, index) {
					var graphicalSquare = d3.select(this);
					graphicalSquare.attr('data-ui', index);
					renderPlayerTokens(graphicalSquare, index, square, state.players());
					
					square.match({
						'estate': updateOwnerBand(graphicalSquare, state.players(), square),
						'railroad': updateOwnerBand(graphicalSquare, state.players(), square),
						'company': updateOwnerBand(graphicalSquare, state.players(), square),
						_: _.noop
					});
				});
			};
	}
	
	function squaresToRows(squares) {
		return [
				squares.slice(0, SQUARES_PER_ROW),
				squares.slice(SQUARES_PER_ROW, SQUARES_PER_ROW * 2),
				squares.slice(SQUARES_PER_ROW * 2, SQUARES_PER_ROW * 3),
				squares.slice(SQUARES_PER_ROW * 3, SQUARES_PER_ROW * 4)
			];
	}
	
	function renderSquare(container, square) {
		square.match({
			'estate': renderEstate(container),
			'railroad': renderRailroad(container),
			'community-chest': function (name) {
				writeText(container, name, 14);
			},
			'chance': function (name) {
				writeText(container, name, 14);
			},
			'income-tax': function (name) {
				writeText(container, name, 14);
				writeText(container, i18n.INCOME_TAX_DESCRIPTION, SQUARE_HEIGHT - 30, 10);
			},
			'luxury-tax': function (name) {
				writeText(container, name, 14);
				writeText(container, i18n.LUXURY_TAX_DESCRIPTION, SQUARE_HEIGHT - 8, 10);
			},
			'company': renderCompany(container),
			'go': renderStart(container),
			'jail': renderJail(container),
			'go-to-jail': function () {
				writeAngledText(container, i18n.GO_TO_JAIL, {x: -8, y: 100}, 12, SQUARE_WIDTH * 2);
			},
			'parking': function () {
				writeAngledText(container, i18n.FREE_PARKING,  {x: -8, y: 100}, 12, SQUARE_WIDTH * 2);
			}
		});
	}
	
	function renderPlayerTokens(container, squareIndex, square, players) {
		var playersOnSquare = _.filter(players, function (player) {
			return player.position() === squareIndex;
		});
		
		var tokens = container.selectAll('.player-token')
			.data(playersOnSquare);
			
		var tokenRadius = 8;
			
		tokens
			.enter()
			.append('circle')
			.classed('player-token', true)
			.attr('data-ui', function (player) {
				return player.id();
			})
			.attr({
				cx: tokenX(square, tokenRadius),
				cy: tokenY(square, tokenRadius),
				r: tokenRadius,
				stroke: 'black',
				'stroke-width': 1
			});
			
		tokens.attr(
			'fill', function (player) {
				return player.color();
			}
		);
			
		tokens.exit().remove();
	}
	
	function tokenX(square, tokenRadius) {
		return function (player, index) {
			return square.match({
				'jail': function () {
					if (player.jailed()) {
						return (SQUARE_WIDTH / 5) * (index % 4 + 1) + SQUARE_WIDTH / 5;
					}
					
					if (index < 4) {
						return SQUARE_HEIGHT - ((SQUARE_HEIGHT / 4 - tokenRadius) / 2 + tokenRadius);
					}
					
					return (SQUARE_HEIGHT / 5) * (index % 4 + 1);
				},
				_: function () {
					return (SQUARE_WIDTH / 5) * (index % 4 + 1);
				}
			});
		};
	}
	
	function tokenY(square, tokenRadius) {
		return function (player, index) {
			return square.match({
				'jail': function () {
					if (player.jailed) {
						return (SQUARE_HEIGHT / 3) * (Math.floor(index / 4) + 1);
					}
					
					if (index < 4) {
						return (SQUARE_HEIGHT / 5) * (index % 4 + 1);
					}
					
					return SQUARE_HEIGHT - ((SQUARE_HEIGHT / 4 - tokenRadius) / 2 + tokenRadius);
				},
				_: function () {
					return (SQUARE_HEIGHT / 3) * (Math.floor(index / 4) + 1);
				}
			});
		};
	}
	
	function updateOwnerBand(container, players, square) {
		var owner = getOwner(players, square);
		
		if (owner) {
			container.select('.owner-band')
				.attr({
					fill: owner.color()
				})
				.style('display', null);
		} else {
			container.select('.owner-band')
				.style('display', 'none');
		}
	}
	
	function renderOwnerBand(container) {
		container.append('rect')
			.attr({
				y: SQUARE_HEIGHT - 3,
				width: SQUARE_WIDTH,
				height: 3,
				stroke: 'black'
			})
			.style('display', 'none')
			.classed('owner-band', true);
	}
	
	function getOwner(players, square) {
		return _.find(players, function (player) {
			return _.some(player.properties(), function (property) {
				return property.equals(square);
			});
		});
	}
	
	function renderEstate(container) {
		return function (_, name, price, group) {
			container.append('rect')
				.attr({
					width: SQUARE_WIDTH,
					height: SQUARE_HEIGHT / 5,
					fill: group.color(),
					stroke: 'black'
				});
				
			writeText(container, name, SQUARE_HEIGHT / 4 + 10);
			writePrice(container, price);
			renderOwnerBand(container);
		};
	}
	
	function renderRailroad(container) {
		return function (_, name, price) {
			container.append('g')
				.attr('transform', 'scale(0.2) translate(50, 140)')
				.html(Symbols.train());
				
			writeText(container, name, 14);
			writePrice(container, price);
			renderOwnerBand(container);
		};
	}
	
	function renderStart(container) {
		return function () {
			var angledContainer = writeAngledText(container, i18n.START_DESCRIPTION, {x: 4, y: 58});
			angledContainer.append('g')
				.attr('transform', 'translate(20, 30)')
				.html(Symbols.go());
			
			container.append('g')
				.attr('transform', 'scale(0.6) translate(6, 134)')
				.html(Symbols.arrow());
		};
	}
	
	function renderCompany(container) {
		return function (_, name, price) {
			writeText(container, name, 14);
			writePrice(container, price);
			renderOwnerBand(container);
		};
	}
	
	function renderJail(container) {
		return function () {
			container.append('rect')
				.attr({
					width: SQUARE_HEIGHT * 3/4,
					height: SQUARE_HEIGHT * 3/4,
					fill: 'orangered',
					stroke: 'black'
				});
				
			container.append('rect')
				.attr({
					width: SQUARE_HEIGHT * 3/8,
					height: SQUARE_HEIGHT * 3/8,
					fill: 'white',
					stroke: 'black',
					transform: 'translate(' + (SQUARE_HEIGHT * 3/11) + ') rotate(45)'
				});
				
			var words = i18n.VISITING_JAIL.split(' ');
			writeText(container, words[0], SQUARE_HEIGHT - 8, 12);
			
			var reversedContainer = container.append('g')
				.attr('transform', 'translate(' + (SQUARE_HEIGHT - 8) + ' ' + (SQUARE_HEIGHT * 3/4) + ') rotate(-90)');
				
			writeText(reversedContainer, words[1], 0, 12);
		};
	}
	
	function writeText(container, text, y, fontSize) {
		TextWrapper.wrap(container, text.toUpperCase(), fontSize || 8, y, SQUARE_WIDTH);
	}
	
	function writeAngledText(container, text, position, fontSize, width) {
		var angledContainer = container.append('g')
			.attr('transform', 'translate(' + position.x + ', ' + position.y + ') rotate(-45)');
			
		TextWrapper.wrap(angledContainer, text.toUpperCase(), fontSize || 8, 0, width || SQUARE_WIDTH);
		
		return angledContainer;
	}
	
	function writePrice(container, price) {
		var priceString = i18n.PRICE_STRING
			.replace('{price}', i18n.formatPrice(price));
		writeText(container, priceString, SQUARE_HEIGHT - 8, 10);
	}
	
	function transformForRow(rowIndex) {
		var transforms = [
			'translate(0, ' + (9 * SQUARE_WIDTH + SQUARE_HEIGHT) + ')',
			'translate(' + SQUARE_HEIGHT + ') rotate(90)',
			'translate(' + (9 * SQUARE_WIDTH + 2 * SQUARE_HEIGHT) + ', ' + SQUARE_HEIGHT + ') rotate(180)',
			'translate(' + (9 * SQUARE_WIDTH + SQUARE_HEIGHT) + ', ' +
				(9 * SQUARE_WIDTH + 2 * SQUARE_HEIGHT)  + ') rotate(270)'
		];
		
		precondition(transforms[rowIndex], 'No transform has been defined for row ' + rowIndex);
		
		return transforms[rowIndex];
	}
}());
},{"./contract":10,"./i18n":24,"./symbols":42,"./text-wrapper":43}],3:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var Property = require('./property');
	var PropertyGroup = require('./property-group');
	
	exports.isBoard = function (candidate) {
		return candidate instanceof Board;
	};
	
	exports.standard = function () {
		var properties = standardProperties();
		return new Board({
			squares: standardSquares(properties),
			properties: properties,
			jailPosition: 10,
			jailBailout: 50,
			startMoney: 1500,
			salary: 200
		});
	};
	
	function Board(info) {
		this._squares = info.squares;
		this._properties = info.properties;
		this._jailPosition = info.jailPosition;
		this._jailBailout = info.jailBailout;
		this._startMoney = info.startMoney;
		this._salary = info.salary;
	}
	
	Board.prototype.playerParameters = function () {
		return {
			startMoney: this._startMoney,
			boardSize: this._squares.length,
			salary: this._salary,
			jailPosition: this._jailPosition
		};
	};
	
	Board.prototype.jailBailout = function () {
		return this._jailBailout;
	};
	
	Board.prototype.properties = function () {
		return this._properties;
	};
	
	Board.prototype.squares = function () {
		return this._squares;
	};
	
	Board.prototype.equals = function (other) {
		precondition(other, 'Testing a board for equality with something else requires that something else');
		
		if (this === other) {
			return true;
		}
		
		if (!(other instanceof Board)) {
			return false;
		}
		
		if (!deepEquals(this._squares, other._squares)) {
			return false;
		}
		
		if (this._jailBailout !== other._jailBailout) {
			return false;
		}
		
		return true;
	};
	
	function standardProperties() {
		var groups = [
			PropertyGroup.newGroup(0, 'midnightblue',    groupMembers),
			PropertyGroup.newGroup(1, 'lightskyblue',    groupMembers),
			PropertyGroup.newGroup(2, 'mediumvioletred', groupMembers),
			PropertyGroup.newGroup(3, 'orange',          groupMembers),
			PropertyGroup.newGroup(4, 'red',             groupMembers),
			PropertyGroup.newGroup(5, 'yellow',          groupMembers),
			PropertyGroup.newGroup(6, 'green',           groupMembers),
			PropertyGroup.newGroup(7, 'blue',            groupMembers)
		];
		
		var railroadGroup = PropertyGroup.railroadGroup(8, 'black',      groupMembers, {value: 200, baseRent: 25});
		var companyGroup =  PropertyGroup.companyGroup(9, ' lightgreen', groupMembers,
			{value: 150, multipliers: [4,10]});
		
		return {
			mediterranean: 	Property.estate('md', i18n.PROPERTY_MD, groups[0], {value: 60,  rent: 2}),
			baltic:			Property.estate('bt', i18n.PROPERTY_BT, groups[0], {value: 60,  rent: 4}),
			east:			Property.estate('et', i18n.PROPERTY_ET, groups[1], {value: 100, rent: 6}),
			vermont:		Property.estate('vt', i18n.PROPERTY_VT, groups[1], {value: 100, rent: 6}),
			connecticut:	Property.estate('cn', i18n.PROPERTY_CN, groups[1], {value: 120, rent: 8}),
			charles:		Property.estate('cl', i18n.PROPERTY_CL, groups[2], {value: 140, rent: 10}),
			us:				Property.estate('us', i18n.PROPERTY_US, groups[2], {value: 140, rent: 10}),
			virginia:		Property.estate('vn', i18n.PROPERTY_VN, groups[2], {value: 160, rent: 12}),
			jack:			Property.estate('jk', i18n.PROPERTY_JK, groups[3], {value: 180, rent: 14}),
			tennessee:		Property.estate('tn', i18n.PROPERTY_TN, groups[3], {value: 180, rent: 14}),
			newYork:		Property.estate('ny', i18n.PROPERTY_NY, groups[3], {value: 200, rent: 16}),
			kentucky:		Property.estate('kt', i18n.PROPERTY_KT, groups[4], {value: 220, rent: 18}),
			indiana:		Property.estate('in', i18n.PROPERTY_IN, groups[4], {value: 220, rent: 18}),
			illinois:		Property.estate('il', i18n.PROPERTY_IL, groups[4], {value: 240, rent: 20}),
			atlantic:		Property.estate('at', i18n.PROPERTY_AT, groups[5], {value: 260, rent: 22}),
			ventnor:		Property.estate('vr', i18n.PROPERTY_VR, groups[5], {value: 260, rent: 22}),
			marvin:			Property.estate('mv', i18n.PROPERTY_MN, groups[5], {value: 280, rent: 24}),
			pacific:		Property.estate('pa', i18n.PROPERTY_PA, groups[6], {value: 300, rent: 26}),
			northCarolina:	Property.estate('nc', i18n.PROPERTY_NC, groups[6], {value: 300, rent: 26}),
			pennsylvania:	Property.estate('pn', i18n.PROPERTY_PN, groups[6], {value: 320, rent: 28}),
			park:			Property.estate('pk', i18n.PROPERTY_PK, groups[7], {value: 350, rent: 35}),
			broadwalk:		Property.estate('bw', i18n.PROPERTY_BW, groups[7], {value: 400, rent: 50}),
			
			readingRailroad:		Property.railroad('rr-reading', i18n.RAILROAD_READING, railroadGroup),
			pennsylvaniaRailroad:	Property.railroad('rr-penn',    i18n.RAILROAD_PENN,    railroadGroup),
			boRailroad:				Property.railroad('rr-bo',      i18n.RAILROAD_B_O,     railroadGroup),
			shortRailroad:			Property.railroad('rr-short',   i18n.RAILROAD_SHORT,   railroadGroup),
			
			electricCompany:	Property.company('electric', i18n.COMPANY_ELECTRIC, companyGroup),
			waterWorks:			Property.company('water',    i18n.COMPANY_WATER,    companyGroup)
		};
	}
	
	function standardSquares(properties) {
		return [
			go(),
			properties.mediterranean,
			communityChest(),
			properties.baltic,
			incomeTax(10, 200),
			properties.readingRailroad,
			properties.east,
			chance(),
			properties.vermont,
			properties.connecticut,
			
			jail(),
			properties.charles,
			properties.electricCompany,
			properties.us,
			properties.virginia,
			properties.pennsylvaniaRailroad,
			properties.jack,
			communityChest(),
			properties.tennessee,
			properties.newYork,
			
			parking(),
			properties.kentucky,
			chance(),
			properties.indiana,
			properties.illinois,
			properties.boRailroad,
			properties.atlantic,
			properties.ventnor,
			properties.waterWorks,
			properties.marvin,
			
			goToJail(),
			properties.pacific,
			properties.northCarolina,
			communityChest(),
			properties.pennsylvania,
			properties.shortRailroad,
			chance(),
			properties.park,
			luxuryTax(75),
			properties.broadwalk
		];
	}
	
	function deepEquals(left, right) {
		if (left.length !== right.length) {
			return false;
		}
		
		return _.every(left, function (element, index) {
			return element.equals(right[index]);
		});
	}
	
	function groupMembers(groupIndex) {
		precondition(_.isNumber(groupIndex) && groupIndex >= 0 && groupIndex < 10,
			'Listing members of a group in board requires the group index');
		
		return _.filter(standardProperties(), function (square) {
			return square.group().index() === groupIndex;
		});
	}
	
	function go() {
		return {
			match: match('go'),
			equals: hasId('go')
		};
	}
	
	function jail() {
		return {
			match: match('jail'),
			equals: hasId('jail')
		};
	}
	
	function parking() {
		return {
			match: match('parking'),
			equals: hasId('parking')
		};
	}
	
	function goToJail() {
		return {
			match: match('go-to-jail'),
			equals: hasId('go-to-jail')
		};
	}
	
	function communityChest() {
		return {
			match: match('community-chest', [i18n.COMMUNITY_CHEST]),
			equals: hasId('community-chest')
		};
	}
	
	function chance() {
		return {
			match: match('chance', [i18n.CHANCE]),
			equals: hasId('chance')
		};
	}
	
	function incomeTax(percentageTax, flatTax) {
		return {
			match: match('income-tax', [i18n.INCOME_TAX, percentageTax, flatTax]),
			equals: hasId('income-tax')
		};
	}
	
	function luxuryTax(amount) {
		return {
			match: match('luxury-tax', [i18n.LUXURY_TAX, amount]),
			equals: hasId('luxury-tax')
		};
	}
	
	function match(fn, args) {
		return function (visitor) {
			if (_.isFunction(visitor[fn])) {
				return visitor[fn].apply(this, args);
			}
			
			return visitor['_']();
		};
	}
	
	function hasId(id) {
		return function (other) {
			precondition(other, 'Testing a square for equality with something else requires that something else');
			
			if (_.isFunction(other.match)) {
				var matcher = { _: function () { return false; } };
				matcher[id] = function () { return true; };
				return other.match(matcher);
			}
			
			return false;
		};
	}
}());

},{"./contract":10,"./i18n":24,"./property":39,"./property-group":38}],4:[function(require,module,exports){
(function() {
	"use strict";
	
	var GameTask = require('./game-task');
	var GameWidget = require('./game-widget');
	
	var failFast = require('./fail-fast');
	
	failFast.crashOnUnhandledException();
    	failFast.crashOnResourceLoadingError();

	$(document).ready(startApplication());

	function startApplication() {
		var container = $('.game-container');

		var task = GameTask.start();
		GameWidget.render(container, task);
	}
}());


},{"./fail-fast":12,"./game-task":17,"./game-widget":18}],5:[function(require,module,exports){
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
},{"./contract":10,"./game-state":16,"./i18n":24,"./property":39}],6:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var GameState = require('./game-state');
	var Player = require('./player');
	var Choices = require('./choices');
	
	exports.newChoice = function (multiplier, toPlayer) {
		precondition(_.isNumber(multiplier) && multiplier > 0,
			'Calculate dice rent choice requires a multiplier greater than 0');
		precondition(toPlayer && Player.isPlayer(toPlayer),
			'Calculate dice rent choice requires the player to pay to');
		
		return new CalculateDiceRentChoice(multiplier, toPlayer);
	};
	
	function CalculateDiceRentChoice(multiplier, toPlayer) {
		this.id = 'calculate-dice-rent';
		this.name = i18n.CHOICE_CALCULATE_DICE_RENT.replace('{multiplier}', multiplier);
		this._multiplier = multiplier;
		this._toPlayer = toPlayer;
	}
	
	CalculateDiceRentChoice.prototype.equals = function (other) {
		if (!(other instanceof CalculateDiceRentChoice)) {
			return false;
		}
		
		return this._multiplier === other._multiplier && this._toPlayer.id() === other._toPlayer.id();
	};
	
	CalculateDiceRentChoice.prototype.requiresDice = function () {
		return true;
	};
	
	CalculateDiceRentChoice.prototype.computeNextState = function (state, dice) {
		precondition(GameState.isGameState(state),
			'To compute next state, a roll-dice choice requires the actual state');
		precondition(dice, 'To compute next state, a roll-dice choice requires the result of a dice roll');
		
		var rent = this._multiplier * (dice[0] + dice[1]);
		var currentPlayer = state.currentPlayer();
		
		return state.changeChoices(Choices.rentChoices(rent, currentPlayer, this._toPlayer));
	};
}());
},{"./choices":7,"./contract":10,"./game-state":16,"./i18n":24,"./player":35}],7:[function(require,module,exports){
(function() {
	"use strict";
	
	var GoBankruptChoice = require('./go-bankrupt-choice');
	var PayRentChoice = require('./pay-rent-choice');
	var PayTaxChoice = require('./pay-tax-choice');
	var Player = require('./player');
	
	var precondition = require('./contract').precondition;
	
	exports.rentChoices = function (rent, fromPlayer, toPlayer) {
		precondition(_.isNumber(rent) && rent > 0, 'Rent choices requires a rent greater than 0');
		precondition(fromPlayer && Player.isPlayer(fromPlayer),
			'Rent choices requires the player who pays');
		precondition(toPlayer && Player.isPlayer(toPlayer),
			'Rent choices requires the player to pay to');
		
		if (rent > fromPlayer.money()) {
			return [GoBankruptChoice.newChoice()];
		}
		
		return [PayRentChoice.newChoice(rent, toPlayer)];
	};
	
	exports.taxChoices = function (tax, fromPlayer) {
		precondition(_.isNumber(tax) && tax > 0, 'Tax choices requires a rent greater than 0');
		precondition(fromPlayer && Player.isPlayer(fromPlayer),
			'Tax choices requires the player who pays');
		
		if (tax > fromPlayer.money()) {
			return [GoBankruptChoice.newChoice()];
		}
		
		return [PayTaxChoice.newChoice(tax)];
	};
}());
},{"./contract":10,"./go-bankrupt-choice":19,"./pay-rent-choice":31,"./pay-tax-choice":32,"./player":35}],8:[function(require,module,exports){
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
},{"./choices":7,"./contract":10,"./game-state":16,"./i18n":24}],9:[function(require,module,exports){
(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.start = function () {
		return new ConfigureGameTask();
	};
	
	function ConfigureGameTask() {
		this._availablePlayerTypes = ['human', 'computer'];
		this._completed = new Rx.AsyncSubject();
		this._playerSlots = new Rx.BehaviorSubject([
			{ type: this._availablePlayerTypes[0] },
			{ type: this._availablePlayerTypes[1] },
			{ type: this._availablePlayerTypes[1] }
		]);
		this._canAddPlayerSlot = new Rx.BehaviorSubject(true);
		this._configurationValid = new Rx.BehaviorSubject(true);
	}
	
	ConfigureGameTask.prototype.availablePlayerTypes = function () {
		return this._availablePlayerTypes.slice();
	};
	
	ConfigureGameTask.prototype.playerSlots = function () {
		return this._playerSlots.takeUntil(this._completed);
	};
	
	ConfigureGameTask.prototype.configurationValid = function () {
		return this._configurationValid.takeUntil(this._completed);
	};
	
	ConfigureGameTask.prototype.addPlayerSlot = function (type) {
		precondition(_.contains(this._availablePlayerTypes, type), 'Player type [' + type + '] is not authorized');
		
		var playerSlots = this._playerSlots;
		var canAddPlayerSlot = this._canAddPlayerSlot;
		var configurationValid = this._configurationValid;
		this._playerSlots.take(1).subscribe(function (slots) {
			slots.push({ type: type });
			playerSlots.onNext(slots);
			if (slots.length === 8) {
				canAddPlayerSlot.onNext(false);
			}
			if (slots.length > 2) {
				configurationValid.onNext(true);
			}
		});
	};
	
	ConfigureGameTask.prototype.removePlayerSlot = function (slotIndex) {
		precondition(_.isNumber(slotIndex) && slotIndex >= 0, 'Removing a player slot requires its index');
		
		var playerSlots = this._playerSlots;
		var canAddPlayerSlot = this._canAddPlayerSlot;
		var configurationValid = this._configurationValid;
		this._playerSlots.take(1).subscribe(function (slots) {
			precondition(slotIndex < slots.length, 'Removing a player slot requires its index to be valid');
			
			slots.splice(slotIndex, 1);
			playerSlots.onNext(slots);
			if (slots.length < 8) {
				canAddPlayerSlot.onNext(true);
			}
			
			if (slots.length < 3) {
				configurationValid.onNext(false);
			}
		});
	};
	
	ConfigureGameTask.prototype.canAddPlayerSlot = function () {
		return this._canAddPlayerSlot.takeUntil(this._completed);
	};
	
	ConfigureGameTask.prototype.startGame = function () {
		this._completed.onNext(true);
		this._completed.onCompleted();
	};
}());
},{"./contract":10}],10:[function(require,module,exports){
(function() {
	"use strict";
	
	exports.precondition = function (check, message) {
        if (check) {
            return;
        }
        throw new Error("Precondition: " + message);
    };
}());
},{}],11:[function(require,module,exports){
(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, rollDiceTask) {
		precondition(container, 'Dice Widget requires a container to render into');
		precondition(rollDiceTask, 'Dice Widget requires a RollDiceTask');
		
		var diceContainer = d3.select(container[0])
			.append('div')
			.classed('dice-container', true);
			
		rollDiceTask.diceRolled().subscribe(function (dice) {
			var diceSelection = diceContainer.selectAll('.die')
				.data(dice);
				
			diceSelection
				.enter()
				.append('div')
				.classed('die', true)
				.append('svg')
				.attr({
					'width': 60,
					'height': 60
				});
				
			diceSelection
				.select('svg')
				.html(function (die) {
					return dieRepresentation(die);
				});
				
		}, _.noop, function () {
			diceContainer.remove();
		});
	};
	
	function dieRepresentation(value) {
		if (value === 6) {
			return dot(15, 15) + dot(30, 15) + dot(45, 15) +
				dot(15, 45) + dot(30, 45) + dot(45, 45);
		}
		
		if (value === 5) {
			return dot(15, 15) + dot(45, 15) + dot(30, 30) +
				dot(15, 45) + dot(45, 45);
		}
		
		if (value === 4) {
			return dot(20, 20) + dot(40, 20) + dot(20, 40) +
				dot(40, 40);
		}
		
		if (value === 3) {
			return dot(15, 30) + dot(30, 30) + dot(45, 30);
		}
		
		if (value === 2) {
			return dot(20, 30) + dot(40, 30);
		}
		
		return dot(30, 30);
	}
	
	function dot(x, y) {
		return "<circle fill='black' r=5 cx=" + x + " cy=" + y + " />";
	}
}());
},{"./contract":10}],12:[function(require,module,exports){
(function () {
    'use strict';

    exports.crashOnUnhandledException = function () {
        // Fail-fast if an unhandled exception occur
        window.onerror = function (message, file, line, column, error) {
            var stackTrace = error && error.stack;
            showError(message, stackTrace);
        };
    };

    exports.crashOnResourceLoadingError = function () {
        var useCapturingEvent = true;

        // Fail-fast if an external resource fail to load
        document.addEventListener('error', function (event) {
            var failedUrl = event.srcElement.src;
            var context = event.srcElement.parentNode.outerHTML;

            showError("Failed to load resource at url: " + failedUrl, context);
        }, useCapturingEvent);
    };

    function showError(message, stackTrace) {
        if (window.isDisplayingError) {
            return;
        }

        // Created with strings so that error in templating won't prevent the error message to show
        $(document.body).html(
            '<h1 style="color: red; padding: 20px 40px; margin 0">The application crashed</h1>' +
            '<p style="padding:5px 40px;"><strong>' + message + '</strong></p>');

        if (stackTrace) {
            var stackContainer = $('<pre style="padding:20px 20px; margin: 0 40px"></pre>');
            $(document.body).append(stackContainer);
            stackContainer.text(stackTrace);

        }

        $(document.body).append(
            '<p style="padding:20px 40px;">' +
            '   <a href="javascript:location.reload();">Refresh the page to continue</a>' +
            '</p>');

        window.isDisplayingError = true;
    }
}());
},{}],13:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var GameState = require('./game-state');
	
	var precondition = require('./contract').precondition;
	
	exports.newChoice = function() {
		return new FinishTurnChoice();
	};
	
	function FinishTurnChoice() {
		this.id = 'finish-turn';
		this.name = i18n.CHOICE_FINISH_TURN;
	}
	
	FinishTurnChoice.prototype.equals = function (other) {
		return (other instanceof FinishTurnChoice);
	};
	
	FinishTurnChoice.prototype.requiresDice = function () {
		return false;
	};
	
	FinishTurnChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'FinishTurnChoice requires a game state to compute the next one');
			
		return GameState.turnStartState({
			board: state.board(),
			players: state.players(),
			currentPlayerIndex: (state.currentPlayerIndex() + 1) % state.players().length
		});
	};
}());
},{"./contract":10,"./game-state":16,"./i18n":24}],14:[function(require,module,exports){
(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.render = function(container, handleChoicesTask) {
		precondition(container, 'The game choices widget requires a container to render into');
		precondition(handleChoicesTask, 'The game choices widget requires a HandleChoicesTask');
		
		var choicesContainer = d3.select(container[0])
			.append('div')
			.classed('monopoly-game-choices', true);
		
		handleChoicesTask.choices().subscribe(function (choices) {
			renderChoices(choicesContainer, handleChoicesTask, choices);
		});
	};
	
	function renderChoices(choicesContainer, handleChoicesTask, choices) {
		var choiceButtons = choicesContainer
			.selectAll('.monopoly-game-choices-item')
			.data(choices);
			
		choiceButtons
			.enter()
			.append('button')
			.classed('monopoly-game-choices-item', true)
			.attr('data-id', function (choice) {
				return choice.id;
			})
			.text(function (choice) {
				return choice.name;
			})
			.on('click', function (choice) {
				handleChoicesTask.makeChoice(choice);
			});
			
		choiceButtons
			.exit()
			.remove();
	}
}());
},{"./contract":10}],15:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var Popup = require('./popup');
	
	exports.render = function (container, configureGameTask) {
		precondition(container, 'Game configuration widget requires container to render into');
		precondition(configureGameTask, 'Game configuration widget requires a ConfigureGameTask');
		
		var panel = d3.select(container[0])
			.append('div')
			.classed('monopoly-game-configuration', true);
			
		panel.append('h1').text(i18n.CONFIGURE_GAME_TITLE);
		
		var slotsContainer = panel.append('div').classed('player-slots', true);
		
		var activeSlotsContainer = slotsContainer.append('div')
			.classed('active-player-slots', true);
		
		var emptyBlock = slotsContainer.append('div')
			.classed({
				'player-slot': true,
				'empty-slot': true
			});
			
		var emptyBlockButton = emptyBlock.append('button')
			.classed('empty-slot-btn', true)
			.text(i18n.BUTTON_ADD_PLAYER);
			
		emptyBlockButton
			.on('click', function () {
				var positionning = firstPlayerTypeOverEmptyBlock(emptyBlockButton, configureGameTask);
				var popup = Popup.render($(document.body), positionning);

				renderPlayerTypesList(popup, configureGameTask);
			});
			
		configureGameTask.canAddPlayerSlot()
			.subscribe(function (canAdd) {
				emptyBlock.style('display', (canAdd ? null : 'none'));
			});
		
		
		configureGameTask.playerSlots()
			.subscribe(function (slots) {
				var slotsSelection = activeSlotsContainer
					.selectAll('.player-slot')
					.data(slots);
					
				createNewSlots(slotsSelection, configureGameTask);
				updateSlots(slotsSelection);
				removeUnneededSlots(slotsSelection);
			});
		
		var startButton = panel.append('button')
			.classed({
				'btn-start-game': true,
				'btn': true,
				'btn-default': true
			})
			.text(i18n.BUTTON_START_GAME)
			.on('click', function () {
				configureGameTask.startGame();
			});
			
		configureGameTask.configurationValid()
			.subscribe(function (valid) {
				startButton.attr('disabled', (valid ? null : 'disabled'));
			});
	};
	
	function firstPlayerTypeOverEmptyBlock(emptyBlockButton, configureGameTask) {
        var buttonRectangle = emptyBlockButton.node().getBoundingClientRect();

        var availableTypes = configureGameTask.availablePlayerTypes();
        var totalChoiceHeight = totalPlayerTypesHeight(availableTypes);
        var popupHeaderHeight = 60;

        return {
            top: String(buttonRectangle.top - 60) + "px",
            left: String(buttonRectangle.left + 25) + "px",
            width: "250px",
            height: String(totalChoiceHeight + popupHeaderHeight) + "px"
        };
    }
	
	function totalPlayerTypesHeight(types) {
        var lineHeight = 32;
        var maxCharacterPerLines = 22;

        return types.map(function (type) {
            var lineCount = Math.ceil(type.length / maxCharacterPerLines);
            return lineCount * lineHeight;
        }).reduce(function (previous, current) {
            return previous + current;
        }, 0);
    }
	
	function renderPlayerTypesList(popup, configureGameTask) {
        var allTypes = configureGameTask.availablePlayerTypes();

        var typeItems = d3.select(popup.contentContainer()[0])
            .append("ul")
            .attr('data-ui', 'available-types')
            .classed('choice-list', true)
            .selectAll('li')
            .data(allTypes);

        var typeButtons = typeItems.enter()
            .append('li')
            .append('button')
            .classed('choice-btn', true)
            .attr({
                'data-ui': 'available-type-choice',
                'data-id': function (type) {
                    return type;
                }
            })
            .on('click', function (type) {
                configureGameTask.addPlayerSlot(type);
                popup.close();
            });

        typeButtons.append('span')
            .classed('choice-label', true)
            .text(function (type) {
                return type === 'human' ? i18n.PLAYER_TYPE_HUMAN : i18n.PLAYER_TYPE_COMPUTER;
            });
    }
	
	function createNewSlots(selection, configureGameTask) {
		var newSlot = selection.enter()
			.append('div')
			.classed('player-slot', true);
			
		newSlot.append('div')
			.classed('player-type-label', true);
			
		newSlot.append('div')
			.classed('remove-player-slot-btn', true)
			.on('click', function (_, index) {
				configureGameTask.removePlayerSlot(index);
			})
			.append('span')
			.classed({
				'glyphicon': true,
				'glyphicon-minus-sign': true
			});
	}
	
	function updateSlots(selection) {
		selection.select('.player-type-label')
			.text(function (slot) {
				return (slot.type === 'human' ? i18n.PLAYER_TYPE_HUMAN : i18n.PLAYER_TYPE_COMPUTER);
			});
			
		selection.select('.remove-player-slot-btn')
			.attr('data-index', function (_, index) {
				return index;
			});
	}
	
	function removeUnneededSlots(selection) {
		selection.exit().remove();
	}
}());
},{"./contract":10,"./i18n":24,"./popup":37}],16:[function(require,module,exports){
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
},{"./accept-offer-choice":1,"./board":3,"./buy-property-choice":5,"./calculate-dice-rent-choice":6,"./choices":7,"./choose-tax-type-choice":8,"./contract":10,"./finish-turn-choice":13,"./go-to-jail-choice":20,"./move-choice":29,"./pay-deposit-choice":30,"./reject-offer-choice":40,"./trade-choice":44,"./trade-offer":45,"./try-double-roll-choice":48}],17:[function(require,module,exports){
(function() {
	"use strict";
	
	var Board = require('./board');
	var PlayGameTask = require('./play-game-task');
	var ConfigureGameTask = require('./configure-game-task');
	
	exports.start = function () {
		return new GameTask();
	};

	function GameTask() {
		this._status = new Rx.BehaviorSubject(configuringStatus(this));
	}
	
	function configuringStatus(self) {
		var task = ConfigureGameTask.start();
		task.playerSlots().last()
			.subscribe(function (players) {
				startGame(players, self);
			});
		
		return {
			statusName: 'configuring',
			match: function (visitor) {
				visitor.configuring(task);
			}
		};
	}
	
	function playingStatus(players, self) {
		var gameConfiguration = { board: Board.standard(), players: players, options: { fastDice: false }};
		var task = PlayGameTask.start(gameConfiguration);
		task.completed().subscribe(function () {
			newGame(self);
		});
				
		return {
			statusName: 'playing',
			match: function (visitor) {
				visitor.playing(task);
			}
		};
	}
	
	function newGame(self) {
		self._status.onNext(configuringStatus(self));
	}
	
	function startGame(players, self) {
		self._status.onNext(playingStatus(players, self));
	}
	
	GameTask.prototype.status = function () {
		return this._status.asObservable();
	};
}());
},{"./board":3,"./configure-game-task":9,"./play-game-task":33}],18:[function(require,module,exports){
(function() {
	"use strict";
	
	var GameConfigurationWidget = require('./game-configuration-widget');
	var MonopolyGameWidget = require('./monopoly-game-widget');
	
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, gameTask) {
		precondition(container, 'A Game widget requires a container to render into');
		precondition(gameTask, 'A Game widget requires a game task');
		
		gameTask.status().subscribe(function (status) {
			d3.select(container[0]).selectAll('*').remove();
			status.match({
				'configuring': renderGameConfiguration(container),
				'playing' : renderGame(container)
			});
		});
	};
	
	function renderGameConfiguration(container) {
		return function (configureGameTask) {
			GameConfigurationWidget.render(container, configureGameTask);
		};
	}
	
	function renderGame(container) {
		return function (playGameTask) {
			MonopolyGameWidget.render(container, playGameTask);
		};
	}
}());
},{"./contract":10,"./game-configuration-widget":15,"./monopoly-game-widget":28}],19:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var GameState = require('./game-state');
	
	exports.newChoice = function() {
		return new GoBankruptChoice();
	};
	
	function GoBankruptChoice() {
		this.id = 'go-bankrupt';
		this.name = i18n.CHOICE_GO_BANKRUPT;
	}
	
	GoBankruptChoice.prototype.equals = function (other) {
		return (other instanceof GoBankruptChoice);
	};
	
	GoBankruptChoice.prototype.requiresDice = function () {
		return false;
	};
	
	GoBankruptChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'GoBankruptChoice requires a game state to compute the next one');
			
		return goBankruptNextState(state);
	};
	
	function goBankruptNextState(state) {
		var newPlayers = _.filter(state.players(), function (player, index) {
			return index !== state.currentPlayerIndex();
		});
		
		if (newPlayers.length === 1) {
			return GameState.gameFinishedState(state.board(), newPlayers[0]);
		}
		
		var newPlayerIndex = state.currentPlayerIndex() % newPlayers.length;
		
		return GameState.turnStartState({
			board: state.board(),
			players: newPlayers,
			currentPlayerIndex: newPlayerIndex
		});
	}
}());
},{"./contract":10,"./game-state":16,"./i18n":24}],20:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var GameState = require('./game-state');
	
	var precondition = require('./contract').precondition;
	
	exports.newChoice = function() {
		return new GoToJailChoice();
	};
	
	function GoToJailChoice() {
		this.id = 'finish-turn';
		this.name = i18n.CHOICE_GO_TO_JAIL;
	}
	
	GoToJailChoice.prototype.equals = function (other) {
		return (other instanceof GoToJailChoice);
	};
	
	GoToJailChoice.prototype.requiresDice = function () {
		return false;
	};
	
	GoToJailChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'GoToJailChoice requires a game state to compute the next one');
			
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return player.jail();
			}
			
			return player;
		});
		
		return GameState.turnEndState({
			board: state.board(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex()
		});
	};
}());
},{"./contract":10,"./game-state":16,"./i18n":24}],21:[function(require,module,exports){
(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.start = function (playGameTask) {
		precondition(playGameTask, 'HandleChoicesTask requires a PlayGameTask');
		
		var humanChoices = new Rx.ReplaySubject(1);
		var completed = new Rx.AsyncSubject();
		gameStateForPlayerType(playGameTask, 'human', completed)
			.map(function (state) {
				return state.choices();
			})
			.subscribe(humanChoices);
		
		var task = new HandleChoicesTask(humanChoices, completed);
		
		gameStateForPlayerType(playGameTask, 'computer', completed)
			.filter(function (state) {
				return state.choices().length > 0;
			})
			.map(computerPlayer)
			.subscribe(applyChoice(task));
			
		return task;
	};
	
	function HandleChoicesTask(humanChoices, completed) {
		this._humanChoices = humanChoices;
		this._choiceMade = new Rx.Subject();
		this._completed = completed;
	}
	
	HandleChoicesTask.prototype.stop = function () {
		this._completed.onNext(true);
		this._completed.onCompleted();
	};
	
	HandleChoicesTask.prototype.choices = function () {
		return this._humanChoices.takeUntil(this._completed);
	};
	
	HandleChoicesTask.prototype.choiceMade = function () {
		return this._choiceMade.takeUntil(this._completed);
	};
	
	HandleChoicesTask.prototype.completed = function () {
		return this._completed.asObservable();
	};
	
	HandleChoicesTask.prototype.makeChoice = function (choice, arg) {
		this._humanChoices.onNext([]);
		this._choiceMade.onNext({choice: choice, arg: arg});
	};
	
	function gameStateForPlayerType(playGameTask, type, completed) {
		return playGameTask.gameState()
			.takeUntil(completed)
			.filter(function (state) {
				return state.currentPlayer().type() === type;
			});
	}
	
	function computerPlayer(state) {
		if (_.isFunction(state.offer)) {
			var valueForCurrentPlayer = calculateOfferValueFor(state.offer(), 0);
			var valueForOtherPlayer = calculateOfferValueFor(state.offer(), 1);
			
			if (valueForCurrentPlayer >= valueForOtherPlayer) {
				return state.choices()[0];
			}
			
			return state.choices()[1];
		}
		
		return state.choices()[0];
	}
	
	function calculateOfferValueFor(offer, playerIndex) {
		return _.reduce(offer.propertiesFor(playerIndex), function (totalValue, property) {
			return totalValue + property.price();
		}, offer.moneyFor(playerIndex));
	}
	
	function applyChoice(task) {
		return function (choice) {
			Rx.Observable.timer(0).subscribe(function () {
				task._choiceMade.onNext({choice: choice});
			});
		};
	}
}());
},{"./contract":10}],22:[function(require,module,exports){
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
},{}],23:[function(require,module,exports){
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
},{}],24:[function(require,module,exports){
(function () {
    'use strict';
    var frenchString = require('./i18n.fr');
    var englishString = require('./i18n.en');

    var ENGLISH_INDICATOR = 'en';
    var FRENCH_INDICATOR = 'fr';

    var navigatorLanguageTag = navigator.language || navigator.userLanguage;
    setApplicationLanguage(navigatorLanguageTag.toLowerCase());

    exports.i18n = function () {
        var currentLanguage = null;

        if (navigatorIsEnglish()) {
            currentLanguage = englishString;
        }
        else if (navigatorIsFrench()) {
            currentLanguage = frenchString;
        } else {
            //Default
            currentLanguage = englishString;
        }
        return currentLanguage;
    };

    function navigatorIsFrench() {
        return window.applicationLanguage.indexOf(FRENCH_INDICATOR) > -1;
    }

    function navigatorIsEnglish() {
        return window.applicationLanguage.indexOf(ENGLISH_INDICATOR) > -1;
    }

    function setApplicationLanguage(applicationLanguage){
        window.applicationLanguage = applicationLanguage;
    }
}());
},{"./i18n.en":22,"./i18n.fr":23}],25:[function(require,module,exports){
(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	var Messages = require('./messages');
	
	exports.start = function (playGameTask) {
		precondition(playGameTask, 'LogGameTask requires a PlayGameTask');
		
		return new LogGameTask(playGameTask);
	};
	
	function LogGameTask(playGameTask) {
		this._messages = new Rx.ReplaySubject(1);
		
		watchGame(this._messages, playGameTask);
	}
	
	function watchGame(messages, playGameTask) {
		Rx.Observable.merge(
			onDiceRolled(playGameTask),
			onPropertyBought(playGameTask),
			onRentPaid(playGameTask),
			onSalaryEarned(playGameTask),
			onTaxPaid(playGameTask),
			onOfferMade(playGameTask),
			onOfferAcceptedOrRejected(playGameTask),
			onPlayerJailed(playGameTask),
			onPlayerGoneBankrupt(playGameTask),
			onGameWon(playGameTask)
		)
		.takeUntil(playGameTask.completed())
		.subscribe(messages);
	}
	
	function diceMessage(dice) {
		if (dice.firstDie === dice.secondDie) {
			return Messages.logDoubleDiceRoll(dice.player, dice.firstDie);
		}
		
		return Messages.logDiceRoll(dice.player, dice.firstDie, dice.secondDie);		
	}
	
	function onDiceRolled(playGameTask) {
		return playGameTask.rollDiceTaskCreated()
			.flatMap(function (task) {
				return task.diceRolled().last().withLatestFrom(
					playGameTask.gameState(),
					combineDiceAndState);
			})
			.map(function (dice) {
				return diceMessage(dice);
			});
	}
	
	function onPropertyBought(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
			.filter(function (states) {
				if (_.isFunction(states.previous.offer)) {
					return false;
				}
				
				return _.some(states.current.players(), function (player, index) {
					var currentProperties = player.properties();
					var previousProperties = states.previous.players()[index].properties();
					
					return currentProperties.length > previousProperties.length;
				});
			})
			.map(function (states) {
				var player = states.previous.players()[states.current.currentPlayerIndex()];
				var newProperty = findNewProperty(states);
				
				return Messages.logPropertyBought(player, newProperty);
			});
	}
	
	function onRentPaid(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
			.filter(function (states) {
				if (_.isFunction(states.previous.offer)) {
					return false;
				}
				
				var fromPlayer = _.find(states.current.players(), function (player, index) {
					return player.money() < states.previous.players()[index].money();
				});
				var toPlayer = _.find(states.current.players(), function (player, index) {
					return player.money() > states.previous.players()[index].money();
				});
				
				return !!fromPlayer && !!toPlayer;
			})
			.map(function (states) {
				var fromPlayer = _.find(states.current.players(), function (player, index) {
					return player.money() < states.previous.players()[index].money();
				});
				var toPlayer = _.find(states.current.players(), function (player, index) {
					return player.money() > states.previous.players()[index].money();
				});
				
				var amount = states.previous.players()[states.current.currentPlayerIndex()].money() -
					states.current.players()[states.current.currentPlayerIndex()].money();
				
				return Messages.logRentPaid(amount, fromPlayer, toPlayer);
			});
	}
	
	function onSalaryEarned(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
			.filter(function (states) {
				return _.reduce(states.current.players(), function (memo, player, index) {
					var previousPlayer = states.previous.players()[index];
					
					if (index === states.current.currentPlayerIndex()) {
						return memo && (player.money() === previousPlayer.money() + 200);
					}
					
					return memo && (player.money() === previousPlayer.money());					
				}, true);
			})
			.map(function (states) {
				var player = states.current.players()[states.current.currentPlayerIndex()];
				
				return Messages.logSalaryReceived(player);
			});
	}
	
	function onOfferMade(playGameTask) {
		return playGameTask.gameState()
			.filter(function (state) {
				return _.isFunction(state.offer);
			})
			.map(function (state) {
				var currentPlayerIndex = _.findIndex(state.players(), function (player) {
					return player.id() === state.offer().currentPlayerId();
				});
				var otherPlayerIndex = _.findIndex(state.players(), function (player) {
					return player.id() === state.offer().otherPlayerId();
				});
				
				var currentPlayer = state.players()[currentPlayerIndex];
				var otherPlayer = state.players()[otherPlayerIndex];
				
				return Messages.logOfferMade(currentPlayer, otherPlayer, state.offer());
			});
	}
	
	function onOfferAcceptedOrRejected(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
			.filter(function (states) {
				return _.isFunction(states.previous.offer) && !states.current.offer;
			})
			.map(function (states) {
				var somePlayerHasChanged =_.some(states.previous.players(), function (player, index) {
					if (player.money() !== states.current.players()[index].money()) {
						return true;
					}
					
					if (!sameProperties(player.properties(), states.current.players()[index].properties())) {
						return true;
					}
					
					
					return false;
				});
				
				if (somePlayerHasChanged) {
					return Messages.logOfferAccepted();
				}
				
				return Messages.logOfferRejected();
			});
	}
	
	function sameProperties(left, right) {
		if (left.length !== right.length) {
			return false;
		}
		
		return _.every(left, function (property, index) {
			return property.id() === right[index].id();
		});
	}
	
	function onTaxPaid(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
			.filter(function (states) {
				var playerWhoPaid = _.find(states.current.players(), function (player, index) {
					return player.money() < states.previous.players()[index].money();
				});
				
				if (playerWhoPaid) {
					var onlyOnePlayerMoneyChanged = _.every(states.current.players(), function (player, index) {
						if (player.id() === playerWhoPaid.id()) {
							return true;
						}
						
						return player.money() === states.previous.players()[index].money();
					});
					
					var noPropertyChanged = _.every(states.current.players(), function (player, index) {
						return player.properties().length === states.previous.players()[index].properties().length;
					});
					
					return onlyOnePlayerMoneyChanged && noPropertyChanged;
				}
				
				return false;
			})
			.map(function (states) {
				var playerWhoPaid = _.find(states.current.players(), function (player, index) {
					return player.money() < states.previous.players()[index].money();
				});
				
				var amount = states.previous.players()[states.current.currentPlayerIndex()].money() -
					playerWhoPaid.money();
				
				return Messages.logTaxPaid(amount, playerWhoPaid);
			});
	}
	
	function onPlayerJailed(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
			.filter(function (states) {
				return !states.previous.players()[states.current.currentPlayerIndex()].jailed() &&
					states.current.players()[states.current.currentPlayerIndex()].jailed();
			})
			.map(function (states) {
				var currentPlayer = states.current.players()[states.current.currentPlayerIndex()];
				
				return Messages.logGoneToJail(currentPlayer);
			});
	}
	
	function onPlayerGoneBankrupt(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
			.filter(function (states) {
				return states.previous.players().length !== states.current.players().length;
			})
			.map(function (states) {
				var playerGoneBankrupt = _.find(states.previous.players(), function (player, index) {
					return states.current.players().length <= index ||
						player.id() !== states.current.players()[index].id();
				});
				
				
				return Messages.logGoneBankrupt(playerGoneBankrupt);
			});
	}
	
	function onGameWon(playGameTask) {
		return playGameTask.gameState()
			.filter(function (state) {
				return state.players().length === 1;
			})
			.map(function (state) {
				var player = state.players()[0];
				
				return Messages.logGameWon(player);
			});
	}
	
	function findNewProperty(states) {
		var previousProperties = states.previous.players()[states.current.currentPlayerIndex()].properties();
		var currentProperties = states.current.players()[states.current.currentPlayerIndex()].properties();
		
		var newProperty = _.filter(currentProperties, function (property) {
			return !_.contains(_.map(previousProperties, function (property) { return property.id(); }), property.id());
		})[0];
		return newProperty;
	}
	
	function combineWithPrevious(observable) {
		var previous;
		var subject = new Rx.Subject();
		observable.subscribe(function (current) {
			if (previous) {
				subject.onNext({
					previous: previous,
					current: current
				});
			}
			previous = current;
		}, subject, subject);
		
		return subject.asObservable();
	}
	
	function combineDiceAndState(dice, state) {
		return {
			firstDie : dice[0],
			secondDie: dice[1],
			player: state.players()[state.currentPlayerIndex()]
		};
	}
	
	LogGameTask.prototype.messages = function () {
		return this._messages.asObservable();
	};
}());
},{"./contract":10,"./messages":27}],26:[function(require,module,exports){
(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, messages) {
		precondition(container, 'LogGame widget requires a container to render into');
		precondition(messages, 'LogGame widget requies a messages observable');
		
		var console = d3.select(container[0])
			.append('div')
			.classed('game-log-console', true);
			
		messages.subscribe(function (log) {
			console.insert('p', '.game-log-message')
				.classed('game-log-message', true)
				.html(log.message())
				.style('opacity', 0)
				.transition().duration(600).style("opacity", 1);
		});
	};
}());
},{"./contract":10}],27:[function(require,module,exports){
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
},{"./contract":10,"./i18n":24,"./player":35,"./property":39,"./trade-offer":45}],28:[function(require,module,exports){
(function() {
	"use strict";
	
	var BoardWidget = require('./board-widget');
	var DiceWidget = require('./dice-widget');
	var GameChoicesWidget = require('./game-choices-widget');
	var PlayersWidget = require('./players-widget');
	var LogGameWidget = require('./log-game-widget');
	var TradeWidget = require('./trade-widget');
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, playGameTask) {
		precondition(container, 'A Monopoly game widget requires a container to render into');
		precondition(playGameTask, 'A Monopoly game widget requires a game task');
		
		var panel = d3.select(container[0])
			.append('div')
			.classed('monopoly-game', true);
			
		var centralComponentsContainer = panel.append('div')
			.classed('monopoly-central-components', true);
			
		centralComponentsContainer.append('button')
			.attr('id', 'new-game-button')
			.classed({
				'btn': true,
				'btn-default': true
			})
			.text(i18n.BUTTON_NEW_GAME)
			.on('click', function() {
				playGameTask.stop();
			});
		
		GameChoicesWidget.render($(centralComponentsContainer[0]), playGameTask.handleChoicesTask());
		LogGameWidget.render($(centralComponentsContainer[0]), playGameTask.messages());
		BoardWidget.render($(panel[0]), playGameTask.gameState().takeUntil(playGameTask.completed()));
		PlayersWidget.render($(panel[0]), playGameTask.gameState().takeUntil(playGameTask.completed()));
		
		playGameTask.rollDiceTaskCreated().subscribe(function (task) {
			DiceWidget.render($(centralComponentsContainer[0]), task);
		});
		
		playGameTask.tradeTaskCreated().subscribe(function (task) {
			TradeWidget.render($(centralComponentsContainer[0]), task);
		});
	};
}());

},{"./board-widget":2,"./contract":10,"./dice-widget":11,"./game-choices-widget":14,"./i18n":24,"./log-game-widget":26,"./players-widget":36,"./trade-widget":47}],29:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var GameState = require('./game-state');
	
	exports.newChoice = function() {
		return new RollDiceChoice();
	};
	
	function RollDiceChoice() {
		this.id = 'roll-dice';
		this.name = i18n.CHOICE_ROLL_DICE;
	}
	
	RollDiceChoice.prototype.equals = function (other) {
		return (other instanceof RollDiceChoice);
	};
	
	RollDiceChoice.prototype.requiresDice = function () {
		return true;
	};
	
	RollDiceChoice.prototype.computeNextState = function (state, dice) {
		precondition(GameState.isGameState(state),
			'To compute next state, a roll-dice choice requires the actual state');
		precondition(dice, 'To compute next state, a roll-dice choice requires the result of a dice roll');
		
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return player.move(dice);
			}
			
			return player;
		});
		
		return GameState.turnEndState({
			board: state.board(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex()
		});
	};
}());
},{"./contract":10,"./game-state":16,"./i18n":24}],30:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var GameState = require('./game-state');
	
	var precondition = require('./contract').precondition;
	
	exports.newChoice = function (amount) {
		precondition(_.isNumber(amount) && amount > 0,
			'A Pay Deposit Choice requires an amount greater than 0');
			
		return new PayDepositChoice(amount);
	};
	
	function PayDepositChoice(amount) {
		this.id = 'pay-deposit';
		this._amount = amount;
		this.name = i18n.CHOICE_PAY_DEPOSIT.replace('{money}', i18n.formatPrice(amount));
	}
	
	PayDepositChoice.prototype.equals = function (other) {
		return (other instanceof PayDepositChoice);
	};
	
	PayDepositChoice.prototype.requiresDice = function () {
		return false;
	};
	
	PayDepositChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'PayDepositChoice requires a game state to compute the next one');
			
		var amount = this._amount;
			
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return player.unjail().pay(amount);
			}
			
			return player;
		});
			
		return GameState.turnEndState({
			board: state.board(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex()
		});
	};
}());
},{"./contract":10,"./game-state":16,"./i18n":24}],31:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var Player = require('./player');
	var GameState = require('./game-state');
	
	exports.newChoice = function (rent, toPlayer) {
		precondition(_.isNumber(rent) && rent > 0, 'Pay rent choice requires a rent greater than 0');
		precondition(toPlayer && Player.isPlayer(toPlayer),
			'Pay rent choice requires the player to pay to');
		
		return new PayRentChoice(rent, toPlayer.id(), toPlayer.name());
	};
	
	function PayRentChoice(rent, toPlayerId, toPlayerName) {
		this.id = 'pay-rent';
		this.name = i18n.CHOICE_PAY_RENT.replace('{rent}', i18n.formatPrice(rent)).replace('{toPlayer}', toPlayerName);
		this._rent = rent;
		this._toPlayerId = toPlayerId;
		this._toPlayerName = toPlayerName;
	}
	
	PayRentChoice.prototype.equals = function (other) {
		if (!(other instanceof PayRentChoice)) {
			return false;
		}
		
		return this._rent === other._rent && this._toPlayerId === other._toPlayerId;
	};
	
	PayRentChoice.prototype.requiresDice = function () {
		return false;
	};
	
	PayRentChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'PayRentChoice requires a game state to compute the next one');
			
		var rent = this._rent;
		var toPlayerId = this._toPlayerId;
		
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return player.pay(rent);
			}
			
			if (player.id() === toPlayerId) {
				return player.earn(rent);
			}
			
			return player;
		});
		
		return GameState.turnEndStateAfterPay({
			board: state.board(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex()
		});
	};
}());
},{"./contract":10,"./game-state":16,"./i18n":24,"./player":35}],32:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var GameState = require('./game-state');
	
	exports.newChoice = function (amount) {
		precondition(_.isNumber(amount) && amount > 0, 'A PayTaxChoice requires a tax greater than 0');
		
		var name = i18n.CHOICE_PAY_TAX.replace('{amount}', i18n.formatPrice(amount));
		return new PayTaxChoice(amount, name);
	};
	
	function PayTaxChoice(amount, name) {
		this.id = 'pay-tax';
		this.name = name;
		this._amount = amount;
	}
	
	PayTaxChoice.prototype.equals = function (other) {
		if (!(other instanceof PayTaxChoice)) {
			return false;
		}
		
		return this._amount === other._amount;
	};
	
	PayTaxChoice.prototype.requiresDice = function () {
		return false;
	};
	
	PayTaxChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'PayTaxChoice requires a game state to compute the next one');
			
		var amount = this._amount;
		
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return player.pay(amount);
			}
			
			return player;
		});
		
		return GameState.turnEndStateAfterPay({
			board: state.board(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex()
		});
	};
}());
},{"./contract":10,"./game-state":16,"./i18n":24}],33:[function(require,module,exports){
(function() {
	"use strict";
	
	var RollDiceTask = require('./roll-dice-task');
	var TradeTask = require('./trade-task');
	var LogGameTask = require('./log-game-task');
	var HandleChoicesTask = require('./handle-choices-task');
	var Player = require('./player');
	var GameState = require('./game-state');
	var TradeOffer = require('./trade-offer');
	var Board = require('./board');
	
	var precondition = require('./contract').precondition;
	
	exports.start = function (gameConfiguration) {
		precondition(Board.isBoard(gameConfiguration.board),
			'PlayGameTask requires a configuration with a board');
		precondition(_.isArray(gameConfiguration.players),
			'PlayGameTask requires a configuration with a list of players');
		precondition(gameConfiguration.options,
			'PlayGameTask requires a configuration with an options object');
		
		var task = new PlayGameTask(gameConfiguration);
		
		listenForChoices(task);	
		
		return task;
	};
	
	function PlayGameTask(gameConfiguration) {		
		this._options = gameConfiguration.options;
		this._completed = new Rx.AsyncSubject();
		this._rollDiceTaskCreated = new Rx.Subject();
		this._tradeTaskCreated = new Rx.Subject();
		
		var initialState = initialGameState(gameConfiguration.board, gameConfiguration.players);
		
		this._gameState = new Rx.BehaviorSubject(initialState);
		
		this._logGameTask = LogGameTask.start(this);
		this._handleChoicesTask = HandleChoicesTask.start(this);	
	}
	
	function listenForChoices(self) {
		self._handleChoicesTask.choiceMade()
			.withLatestFrom(self._gameState, function (action, state) {
				return {
					choice: action.choice,
					arg: action.arg,
					state: state
				};
			})
			.flatMap(computeNextState(self))
			//.subscribe(self._gameState);
			.subscribe(function (state) {
				self._gameState.onNext(state);
			});
	}
	
	function initialGameState(board, players) {
		return GameState.turnStartState({
			board: board,
			players: Player.newPlayers(players, board.playerParameters()),
			currentPlayerIndex: 0
		});
	}
	
	PlayGameTask.prototype.handleChoicesTask = function () {
		return this._handleChoicesTask;
	};
	
	PlayGameTask.prototype.messages = function () {
		return this._logGameTask.messages().takeUntil(this._completed);
	};
	
	PlayGameTask.prototype.gameState = function () {
		return this._gameState.asObservable();//.takeUntil(this._completed);
	};
	
	PlayGameTask.prototype.rollDiceTaskCreated = function () {
		return this._rollDiceTaskCreated.takeUntil(this._completed);
	};
	
	PlayGameTask.prototype.tradeTaskCreated = function () {
		return this._tradeTaskCreated.takeUntil(this._completed);
	};
	
	PlayGameTask.prototype.completed = function () {
		return this._completed.asObservable();
	};
	
	PlayGameTask.prototype.stop = function () {
		this._handleChoicesTask.stop();
		
		this._completed.onNext(true);
		this._completed.onCompleted();
	};
	
	function computeNextState(self) {
		return function (action) {
			if (action.choice.requiresDice()) {
				return computeNextStateWithDice(self, action.state, action.choice);
			}
			
			if (_.isFunction(action.choice.requiresTrade)) {
				return computeNextStateWithTrade(self, action.state, action.choice, action.arg);
			}
			
			var nextState = action.choice.computeNextState(action.state);
			return Rx.Observable.return(nextState);
		};
	}
	
	function computeNextStateWithDice(self, state, choice) {
		var task = RollDiceTask.start({
			fast: self._options.fastDice,
			dieFunction: self._options.dieFunction
		});
		
		self._rollDiceTaskCreated.onNext(task);
		return task.diceRolled().last()
			.map(function (dice) {
				return choice.computeNextState(state, dice);
			});
	}
	
	function computeNextStateWithTrade(self, state, choice, arg) {
		if (TradeOffer.isOffer(arg) && !arg.isEmpty()) {
			var nextState = choice.computeNextState(state, arg);
			return Rx.Observable.return(nextState);
		}
				
		var currentPlayer = state.players()[state.currentPlayerIndex()];
		var otherPlayer = choice.otherPlayer();
		var task = TradeTask.start(currentPlayer, otherPlayer);
		
		self._tradeTaskCreated.onNext(task);
		return task.offer().last()
			.map(function (offer) {
				return choice.computeNextState(state, offer);
			});
	}
}());
},{"./board":3,"./contract":10,"./game-state":16,"./handle-choices-task":21,"./log-game-task":25,"./player":35,"./roll-dice-task":41,"./trade-offer":45,"./trade-task":46}],34:[function(require,module,exports){
(function() {
	"use strict";
	
	exports.colors = function () {
		return [
			'red', 'lawngreen', 'darkblue', 'cyan', 'deepskyblue', 'darkslategrey', 'lightsalmon', 'silver'
		];
	};
}());
},{}],35:[function(require,module,exports){
(function() {
	"use strict";
	
	var PlayerColors = require('./player-colors').colors();
	var Property = require('./property');
	
	var precondition = require('./contract').precondition;
	var i18n = require('./i18n').i18n();
	
	exports.isPlayer = function (candidate) {
		return candidate instanceof Player;
	};
	
	exports.newPlayers = function (playerConfigurations, boardParameters) {
		precondition(_.isArray(playerConfigurations) && playerConfigurations.length >= 3,
			'Creating players require at least 3 player configurations');
		precondition(_.isNumber(boardParameters.startMoney) && boardParameters.startMoney,
			'Creating players require an amount of money each player starts with');
		precondition(_.isNumber(boardParameters.boardSize) && boardParameters.boardSize > 0,
			'Creating players require a board size');
		precondition(_.isNumber(boardParameters.salary) && boardParameters.salary > 0,
			'Creating players require the salary players get when lapping the board');
		precondition(_.isNumber(boardParameters.jailPosition) && boardParameters.jailPosition,
			'Creating players require a jail position');
		
		return _.map(playerConfigurations, function (playerConfiguration, index) {
			return newPlayer({
				id: 'player' + index,
				name: i18n.DEFAULT_PLAYER_NAME.replace('{index}', index + 1),
				money: boardParameters.startMoney,
				position: 0,
				color: PlayerColors[index],
				type: playerConfiguration.type,
				properties: [],
				boardParameters: boardParameters
			});
		});
	};
	
	function newPlayer(info) {
		precondition(_.isString(info.id) && info.id !== '', 'Player requires an id');
		precondition(_.isString(info.name) && info.name !== '', 'Player requires a name');
		precondition(_.isNumber(info.money) && info.money >= 0, 'Player requires an amount of money');
		precondition(_.isNumber(info.position) && info.position >= 0, 'Player requires a position');
		precondition(_.isString(info.color) && info.color !== '', 'Player requires a color');
		precondition(_.isString(info.type) && validPlayerType(info.type), 'Player requires a valid type');
		precondition(_.isArray(info.properties), 'Player requires a list of properties');
		precondition(info.boardParameters, 'Player requires board parameters');
		
		return new Player(info);
	}
	
	function validPlayerType(type) {
		return type === 'human' || type === 'computer';
	}
	
	function Player(info) {
		this._id = info.id;
		this._name = info.name;
		this._money = info.money;
		this._position = info.position;
		this._color = info.color;
		this._type = info.type;
		this._properties = info.properties;
		this._jailed = false;
		this._boardParameters = info.boardParameters;
	}
	
	Player.prototype.id = function () {
		return this._id;
	};
	
	Player.prototype.name = function () {
		return this._name;
	};
	
	Player.prototype.money = function () {
		return this._money;
	};
	
	Player.prototype.position = function () {
		return this._position;
	};
	
	Player.prototype.color = function () {
		return this._color;
	};
	
	Player.prototype.type = function () {
		return this._type;
	};
	
	Player.prototype.properties = function () {
		return this._properties.slice();
	};
	
	Player.prototype.jailed = function () {
		return this._jailed;
	};
	
	Player.prototype.equals = function (other) {
		precondition(other, 'Testing a player for equality with something else requires that something else');
		
		if (this === other) {
			return true;
		}
		
		if (!(other instanceof Player)) {
			return false;
		}
		
		if (this._id !== other._id) {
			return false;
		}
		
		if (this._name !== other._name) {
			return false;
		}
		
		if (this._money !== other._money) {
			return false;
		}
		
		if (this._position !== other._position) {
			return false;
		}
		
		if (this._color !== other._color) {
			return false;
		}
		
		if (this._type !== other._type) {
			return false;
		}
		
		if (this._jailed !== other._jailed) {
			return false;
		}
		
		return sameProperties(this._properties, other._properties);
	};
	
	function sameProperties(left, right) {
		if (left.length !== right.length) {
			return false;
		}
		
		return _.every(left, function (property, index) {
			return property.id() === right[index].id();
		});
	}
	
	/**
	 * Calculates the net worth of the player (i.e. money + owned properties values).
	 */
	Player.prototype.netWorth = function () {
		var valueOfProperties = _.reduce(this._properties, function (total, property) {
			return total + property.price();
		}, 0);
		
		return this.money() + valueOfProperties;
	};
	
	Player.prototype.move = function (dice) {
		precondition(_.isArray(dice) && dice.length === 2 && _.isNumber(dice[0]) && _.isNumber(dice[1]),
			'Moving a player requires a dice with two numbers');
			
		var squareCount = this._boardParameters.boardSize;
		var newPosition = this.position() + dice[0] + dice[1];
		
		return newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money() + (newPosition >= squareCount ? this._boardParameters.salary : 0),
			position: newPosition % squareCount,
			color: this.color(),
			type: this.type(),
			properties: this.properties(),
			boardParameters: this._boardParameters
		});
	};
	
	Player.prototype.jail = function () {
		var player = newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money(),
			position: this._boardParameters.jailPosition,
			color: this.color(),
			type: this.type(),
			properties: this.properties(),
			boardParameters: this._boardParameters
		});
		
		player._jailed = true;
		
		return player;
	};
	
	Player.prototype.unjail = function () {
		var player = newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money(),
			position: this.position(),
			color: this.color(),
			type: this.type(),
			properties: this.properties(),
			boardParameters: this._boardParameters
		});
		
		player._jailed = false;
		
		return player;
	};
	
	Player.prototype.buyProperty = function (property) {
		precondition(property && Property.isProperty(property), 'Player buying property requires a property');
		
		var alreadyOwned = !!_.find(this.properties(), function (ownedProperty) {
			return ownedProperty.id() === property.id();
		});
		
		precondition(!alreadyOwned, 'Player cannot buy a property he already owns');
		
		return newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money() - property.price(),
			position: this.position(),
			color: this.color(),
			type: this.type(),
			properties: insertProperty(property, this.properties()),
			boardParameters: this._boardParameters
		});
	};
	
	function insertProperty(property, properties) {
		return insertPropertyAt(property, 0, properties);
	}
	
	function insertPropertyAt(property, index, properties) {
		if (index === properties.length) {
			return properties.concat([property]);
		}
		
		var otherProperty = properties[index];
		
		if (property.compareTo(otherProperty) === 1) {
			// It comes before, so insert it at index
			var newProperties = properties.slice();
			newProperties.splice(index, 0, property);
			return newProperties;
		}
		
		// It comes after, so look further in the array
		return insertPropertyAt(property, index + 1, properties);
	}
	
	Player.prototype.gainProperty = function (property) {
		precondition(property && Property.isProperty(property), 'Player gaining property requires a property');
		
		var alreadyOwned = !!_.find(this.properties(), function (ownedProperty) {
			return ownedProperty.id() === property.id();
		});
		
		precondition(!alreadyOwned, 'Player cannot gain a property he already owns');
		
		return newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money(),
			position: this.position(),
			color: this.color(),
			type: this.type(),
			properties: insertProperty(property, this.properties()),
			boardParameters: this._boardParameters
		});
	};
	
	Player.prototype.loseProperty = function (property) {
		precondition(property && Property.isProperty(property), 'Player losing property requires a property');
		
		var alreadyOwned = !!_.find(this.properties(), function (ownedProperty) {
			return ownedProperty.id() === property.id();
		});
		
		precondition(alreadyOwned, 'Player cannot lose a property he does not already owns');
		
		return newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money(),
			position: this.position(),
			color: this.color(),
			type: this.type(),
			properties: _.filter(this.properties(), function (ownedProperty) {
				return ownedProperty.id() !== property.id();
			}),
			boardParameters: this._boardParameters
		});
	};
	
	Player.prototype.pay = function (amount) {
		precondition(_.isNumber(amount) && amount >= 0,
			'Player requires an amount to pay, that is greater than or equal to 0');
			
		precondition(this.money() > amount, 'Player does not have enough money to pay ' + amount);
		
		return playerWithAdditionalMoney(this, -amount);
	};
	
	Player.prototype.earn = function (amount) {
		precondition(_.isNumber(amount) && amount >= 0,
			'Player requires an amount to earn, that is greater than or equal to 0');
		
		return playerWithAdditionalMoney(this, amount);
	};
	
	function playerWithAdditionalMoney(player, amount) {
		return newPlayer({
			id: player.id(),
			name: player.name(),
			money: player.money() + amount,
			position: player.position(),
			color: player.color(),
			type: player.type(),
			properties: player.properties(),
			boardParameters: player._boardParameters
		});
	}
}());
},{"./contract":10,"./i18n":24,"./player-colors":34,"./property":39}],36:[function(require,module,exports){
(function() {
	"use strict";
	
	var precondition =  require('./contract').precondition;
	var i18n = require('./i18n').i18n();
	
	exports.render = function (container, gameState) {
		precondition(container, 'Players widget requires a container to render into');
		precondition(gameState, 'Players widget requires an observable of the gameState');
		
		var panel = d3.select(container[0])
			.append('div')
			.classed('monopoly-players', true);
			
		gameState.subscribe(renderPlayerPanels(panel));
	};
	
	function renderPlayerPanels(container) {
		return function (state) {
			var panelSelection = container.selectAll('.player-panel')
				.data(state.players(), function (player) {
					return player.id();
				});
				
			createPlayerPanels(panelSelection);
			updatePlayerPanels(panelSelection, state);
			removeUnneededPlayerPanels(panelSelection);
		};
	}
	
	function createPlayerPanels(selection) {
		var panels = selection
			.enter()
			.append('div')
			.classed('player-panel', true)
			.attr('data-ui', function (player) {
				return player.id();
			});
			
		createPlayerTokens(panels);
			
		panels
			.append('span')
			.classed('player-name', true)
			.text(function (player) {
				return player.name();
			});
			
		panels
			.append('span')
			.classed('player-money', true)
			.attr('data-ui', 0);
			
		panels.append('div')
			.classed('player-properties', true);
	}
	
	function removeUnneededPlayerPanels(selection) {
		selection.exit().remove();
	}
	
	function createPlayerTokens(panels) {
		panels
			.append('svg')
			.attr({
				width: 12,
				height: 12
			})
			.classed('player-panel-token', true)
			.append('circle')
			.attr({
				cx: 6,
				cy: 6,
				r: 6,
				fill: function (player) {
					return player.color();
				}
			});
	}
	
	function updatePlayerPanels(selection, state) {
		selection
			.select('.player-money')
			.attr('data-ui', function (player) {
				var element = d3.select(this);
				var previousMoney = element.attr('data-ui');
				if (previousMoney > player.money()) {
					element.style('color', 'red');
					element.transition().duration(700).style('color', 'black');
				} else if (previousMoney < player.money()) {
					element.style('color', 'forestgreen');
					element.transition().duration(700).style('color', 'black');
				}
				return player.money();
			})
			.text(function (player) {
				return i18n.formatPrice(player.money());
			});
			
		var playerPropertiesSelection = selection
			.select('.player-properties')
			.selectAll('.player-property')
			.data(function (player) {
				return player.properties();
			}, function (property) { return property.id(); });
			
		createPlayerProperties(playerPropertiesSelection, state);
	}
	
	function createPlayerProperties(selection, state) {
		selection.enter()
			.append('div')
			.classed('player-property', true)
			.attr('data-ui', function (property) {
				return property.id(); 
			})
			.text(function (property) {
				return property.name();
			})
			.style('background-color', function (property) {
				return property.group().color();
			});
			
		selection.order();
		
		selection.exit().remove();
	}
}());
},{"./contract":10,"./i18n":24}],37:[function(require,module,exports){
(function () {
    'use strict';

    var precondition = require('./contract').precondition;

    exports.render = function (container, positioning, options) {
        precondition(container, "A popup require a positionned container to render into");
        // Example : top + height + left + width, OR top + bottom + left + width, and so forth
        precondition(isFullyPositioned(positioning), "The popup must be fully positioned vertically and horizontally");

		options = options || defaultOptions();
        var htmlElements = renderDom(container, positioning);
        var closedSubject = bindEvents(htmlElements.popupElement, options);

        return externalInterface(htmlElements, closedSubject);
    };
	
	function defaultOptions() {
		return {
			closeBtn : true
		};
	}

    function isFullyPositioned(positioning) {
        var cssAttributes = _.keys(positioning);
        var heightAttributes = ["top", "bottom", "height"];
        var widthAttributes = ["left", "width", "right"];

        return cssAttributes.length === 4 &&
            _.intersection(cssAttributes, heightAttributes).length === 2 &&
            _.intersection(cssAttributes, widthAttributes).length === 2;
    }

    function renderDom(container, positioning) {
        var popupElement = d3.select(container[0])
            .append('div')
            .classed('popup', true)
            // The CSS classes are not accessible in the test so we set the position in javascript
            .style('position', 'absolute')
            .style(positioning);

        var contentContainer = popupElement.append('div')
            .classed('popup-content', true);

        return {
            popupElement: popupElement,
            contentContainer: contentContainer
        };
    }

    function bindEvents(popupElement, options) {
		var closedSubject = new Rx.AsyncSubject();
		
		if (options.closeBtn) {
			var closeButton = popupElement.append('button')
				.classed('popup-close-btn', true)
				.attr('data-ui', 'popup-close')
				.on('click', function () {
					closePopup(popupElement, closedSubject);
				});
				
			closeButton.append('span')
				.classed({
					'glyphicon': true,
					'glyphicon-remove': true
				});
		}
        
		return closedSubject;
    }

    function externalInterface(htmlElements, closedSubject) {
        return {
            contentContainer: function () {
                return $(htmlElements.contentContainer[0]);
            },

            closed: function () {
                return closedSubject.asObservable();
            },

            close: function () {
                closePopup(htmlElements.popupElement, closedSubject);
            }
        };
    }

    function closePopup(popupElement, closedSubject) {
        popupElement.classed('.popup-closing', true);
        popupElement.remove();
        closedSubject.onNext(true);
        closedSubject.onCompleted();
    }
}());
},{"./contract":10}],38:[function(require,module,exports){
(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.isGroup = function (candidate) {
		return candidate instanceof PropertyGroup;
	};
	
	exports.newGroup = function (index, color, properties) {
		precondition(_.isNumber(index), 'PropertyGroup requires an index');
		precondition(_.isString(color), 'PropertyGroup requires a color');
		precondition(_.isFunction(properties), 'PropertyGroup requires a function to list its properties');
		
		return new PropertyGroup(index, color, properties);
	};
	
	exports.companyGroup = function (index, color, properties, prices) {
		precondition(_.isNumber(index), 'Company property group requires an index');
		precondition(_.isString(color), 'Company property group requires a color');
		precondition(_.isFunction(properties), 'Company property group requires a function to list its properties');
		precondition(_.isNumber(prices.value) && prices.value > 0, 'Company property group requires a value');
		precondition(_.isArray(prices.multipliers) && prices.multipliers.length === 2,
			'Company property group requires a list of multipliers');
		
		var group = new PropertyGroup(index, color, properties);
		
		group.propertyValue = function () {
			return prices.value;
		};
		
		group.multipliers = function () {
			return prices.multipliers;
		};
		
		return group;
	};
	
	exports.railroadGroup = function (index, color, properties, prices) {
		precondition(_.isNumber(index), 'Railroad property group requires an index');
		precondition(_.isString(color), 'Railroad property group requires a color');
		precondition(_.isFunction(properties), 'Railroad property group requires a function to list its properties');
		precondition(_.isNumber(prices.value) && prices.value > 0, 'Railroad property group requires a value');
		precondition(_.isNumber(prices.baseRent) && prices.baseRent > 0,
			'Railroad property group requires a base rent');
		
		var group = new PropertyGroup(index, color, properties);
		
		group.propertyValue = function () {
			return prices.value;
		};
		
		group.baseRent = function () {
			return prices.baseRent;
		};
		
		return group;
	};
	
	function PropertyGroup(index, color, properties) {
		this._index = index;
		this._color = color;
		this._properties = properties;
	}
	
	PropertyGroup.prototype.index = function () {
		return this._index;
	};
	
	PropertyGroup.prototype.color = function () {
		return this._color;
	};
	
	PropertyGroup.prototype.properties = function () {
		return this._properties(this._index);
	};
	
	PropertyGroup.prototype.compareTo = function (other) {
		precondition(other && other instanceof PropertyGroup,
			'Comparing this group to another group requires that other group');
			
		if (this._index === other._index) {
			return 0;
		}
		
		return (this._index < other._index ? 1 : -1);
	};
}());
},{"./contract":10}],39:[function(require,module,exports){
(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	var PropertyGroup = require('./property-group');
	
	exports.isProperty = function (candidate) {
		return candidate instanceof Property;
	};
	
	exports.estate = function (id, name, group, prices) {
		precondition(_.isString(id) && id.length > 0, 'Estate requires an id');
		precondition(_.isString(name) && name.length > 0, 'Estate requires a name');
		precondition(group && PropertyGroup.isGroup(group), 'Estate requires a group');
		precondition(_.isNumber(prices.value) && prices.value > 0, 'Estate requires a price');
		precondition(_.isNumber(prices.rent) && prices.rent > 0, 'Estate requires a rent');
		
		return new Property({
			id: id,
			name: name,
			group: group,
			type: 'estate',
			price: prices.value,
			rent: estateRent(prices.rent, group)
		});
	};
	
	function estateRent(baseRent, group) {
		return function (ownerProperties) {
			var multiplier = (ownsAllEstatesInGroup(group, ownerProperties) ? 2 : 1);
			return { amount: baseRent * multiplier };
		};
	}
	
	function ownsAllEstatesInGroup(group, properties) {
		var estatesInGroup = group.properties();
		return _.every(estatesInGroup, function (estate) {
			var id = estate.id();
			
			return _.contains(_.map(properties, function (property) { return property.id(); }), id);
		});
	}
	
	exports.company = function (id, name, group) {
		precondition(_.isString(id) && id.length > 0, 'Company requires an id');
		precondition(_.isString(name) && name.length > 0, 'Company requires a name');
		precondition(group && PropertyGroup.isGroup(group), 'Creating a company requires a group');
		
		return new Property({
			id: id,
			name: name,
			group: group,
			type: 'company',
			price: group.propertyValue(),
			rent: companyRent(group)
		});
	};
	
	function companyRent(group) {
		return function (ownerProperties) {
			var multiplier = allCompanies(group, ownerProperties) ? group.multipliers()[1] : group.multipliers()[0];
			return {multiplier: multiplier};
		};
	}
	
	function allCompanies(group, properties) {
		return _.reduce(properties, function (count, property) {
			if (_.contains(_.map(group.properties(), propertyId), property.id())) {
				return count + 1;
			}
			
			return count;
		}, 0) === 2;
	}
	
	exports.railroad = function (id, name, group) {
		precondition(_.isString(id) && id.length > 0, 'Railroad requires an id');
		precondition(_.isString(name) && name.length > 0, 'Railroad requires a name');
		precondition(group && PropertyGroup.isGroup(group), 'Railroad requires a group');
		
		return new Property({
			id: id,
			name: name,
			group: group,
			type: 'railroad',
			price: group.propertyValue(),
			rent: railroadRent(group)
		});
	};
	
	function railroadRent(group) {
		return function (ownerProperties) {
			var count = railroadCountIn(group, ownerProperties);
			return { amount: group.baseRent() * Math.pow(2, count - 1) };
		};
	}
	
	function railroadCountIn(group, properties) {
		return _.reduce(properties, function (count, property) {
			if (_.contains(_.map(group.properties(), propertyId), property.id())) {
				return count + 1;
			}
			
			return count;
		}, 0);
	}
	
	function propertyId(property) {
		return property.id();
	}
	
	function Property(info) {
		this._id = info.id;
		this._name = info.name;
		this._group = info.group;
		this._price = info.price;
		this._rent = info.rent;
		this._type = info.type;
	}
	
	Property.prototype.id = function () {
		return this._id;
	};
	
	Property.prototype.name = function () {
		return this._name;
	};
	
	Property.prototype.price = function () {
		return this._price;
	};
	
	Property.prototype.rent = function (ownerProperties) {
		return this._rent(ownerProperties);
	};
	
	Property.prototype.group = function () {
		return this._group;
	};
	
	Property.prototype.match = function (visitor) {
		return matchWithDefault(visitor, this._type, [this._id, this._name, this._price, this._group]);
	};
	
	function matchWithDefault(visitor, fn, args) {
		if (_.isFunction(visitor[fn])) {
			return visitor[fn].apply(visitor, args);
		}
		
		return visitor['_']();
	}
	
	Property.prototype.compareTo = function (property) {
		precondition(property && property instanceof Property,
			'Comparing this property to another property requires that other property');
		
		if (this._id === property._id) {
			return 0;
		}
		
		var groupComparison = this._group.compareTo(property._group);
		if (groupComparison === 1) {
			return 1;
		} else if (groupComparison === -1) {
			return -1;
		}
		
		var indexesInGroup = {};
		_.each(property._group.properties(), function (estate, index) {
			indexesInGroup[estate.id()] = index;
		});
		
		if (indexesInGroup[this._id] < indexesInGroup[property._id]) {
			return 1;
		}
		
		return -1;		
	};
	
	Property.prototype.equals = function (other) {
		precondition(other, 'Testing a property for equality with something else requires that something else');
		
		if (this === other) {
			return true;
		}
		
		return other instanceof Property && this._id === other._id;
	};
}());
},{"./contract":10,"./property-group":38}],40:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var GameState = require('./game-state');
	
	exports.newChoice = function (offerCurrentPlayerId) {
		precondition(_.isString(offerCurrentPlayerId), 'A RejectOfferChoice requires an offer current player id');
		
		return new RejectOfferChoice(offerCurrentPlayerId);
	};
	
	function RejectOfferChoice(offerCurrentPlayerId) {
		this.id = 'reject-offer';
		this.name = i18n.CHOICE_REJECT_OFFER;
		this._offerCurrentPlayerId = offerCurrentPlayerId;
	}
	
	RejectOfferChoice.prototype.equals = function (other) {
		if (!(other instanceof RejectOfferChoice)) {
			return false;
		}
		
		if (this._offerCurrentPlayerId !== other._offerCurrentPlayerId) {
			return false;
		}
		
		return true;
	};
	
	RejectOfferChoice.prototype.requiresDice = function () {
		return false;
	};
	
	RejectOfferChoice.prototype.computeNextState = function (state) {
		precondition(GameState.isGameState(state),
			'RejectOfferChoice requires a game state to compute the next one');
			
		var self = this;
		var playerIndex = _.findIndex(state.players(), function (player) {
			return player.id() === self._offerCurrentPlayerId;
		});
		
		precondition(playerIndex >= 0, 'Offer rejected must have been made by a valid player');
		
		return GameState.turnStartState({
			board: state.board(),
			players: state.players(),
			currentPlayerIndex: playerIndex
		});
	};
}());
},{"./contract":10,"./game-state":16,"./i18n":24}],41:[function(require,module,exports){
(function() {
	"use strict";
	
	exports.start = function (options) {
		return new RollDiceTask(
			options && options.fast || false,
			options && options.dieFunction || rollDie);
	};
	
	function RollDiceTask(fastOption, dieFunction) {
		this._diceRolled = new Rx.BehaviorSubject([dieFunction(), dieFunction()]);
		
		rollDice(fastOption, dieFunction, this._diceRolled);
	}
	
	function rollDice(fastOption, dieFunction, diceRolled) {
		Rx.Observable.interval(100)
			.take(fastOption ? 1 : 15)
			.map(function () {
				return [dieFunction(), dieFunction()];
			})
			.subscribe(diceRolled);
	}
	
	function rollDie() {
		return Math.floor((Math.random() * 6) + 1);
	}
	
	RollDiceTask.prototype.diceRolled = function () {
		return this._diceRolled.asObservable();
	};
}());
},{}],42:[function(require,module,exports){
(function() {
	"use strict";
	
	exports.train = function () {
		return '<path fill="#231f20" d=" M 53.25 32.29 C 67.32 32.29 81.38 31.88 95.44 31.75 C 98.36 ' + 
			'36.41 01.25 41.09 104.10 45.79 C 97.92 65.46 91.66 85.11 85.40 104.76 C 112.26 104.74 ' +
			'139.12 104.76 165.98 104.75 C 175.59 105.16 185.21 105.00 194.83 104.95 C 195.30 103.72 ' +
			'195.11 102.66 194.25 101.75 C 187.88 94.04 182.81 84.83 181.69 74.75 C 180.70 67.33 ' +
			'182.07 59.50 186.08 53.11 C 189.44 47.44 195.60 43.66 202.07 42.77 C 223.29 42.73 244.52 ' +
			'42.76 265.75 42.76 C 265.64 47.26 265.90 51.75 266.04 56.24 C 257.26 68.06 247.71 79.67 ' +
			'242.29 93.52 C 235.94 107.42 233.68 123.53 237.79 138.39 C 240.30 147.47 246.53 154.83 ' +
			'252.74 161.66 C 252.75 164.02 252.75 166.38 252.75 168.75 C 246.50 168.77 240.23 168.57 ' +
			'234.01 169.33 C 232.38 169.35 233.30 171.20 233.99 171.84 C 239.63 179.37 240.63 189.78 ' +
			'237.53 198.54 C 235.22 205.20 230.08 210.74 223.75 213.79 C 215.17 218.40 204.32 217.83 ' +
			'195.89 213.18 C 189.05 209.12 184.00 202.15 182.25 194.40 C 180.57 185.77 182.48 176.39 ' +
			'188.13 169.54 C 167.12 169.93 146.10 169.61 125.09 169.83 C 129.60 174.39 133.32 180.03 ' +
			'134.26 186.49 C 136.20 197.28 131.00 208.94 121.54 214.54 C 114.51 218.47 105.82 219.38 ' +
			'98.17 216.78 C 89.87 213.94 82.88 206.96 80.88 198.31 C 78.11 188.23 81.30 176.85 89.28 ' +
			'170.01 C 85.83 169.99 82.37 170.00 78.92 169.99 C 73.14 185.67 68.43 201.72 62.95 217.51 ' +
			'C 47.59 217.43 32.23 217.63 16.87 217.40 C 29.42 201.68 42.34 186.26 54.82 170.50 C 52.06 ' +
			'169.59 48.72 170.83 46.43 168.70 C 35.32 160.78 29.45 146.29 32.14 132.88 C 32.29 126.89 ' +
			'35.46 121.66 38.43 116.66 C 41.50 112.73 45.25 109.37 48.91 106.00 C 53.89 106.00 58.88 ' +
			'106.00 63.86 105.99 C 57.22 85.55 50.82 65.02 44.16 44.58 C 47.19 40.49 50.17 36.35 53.25 32.29 Z" />';
	};
	
	exports.arrow = function () {
		return '<path stroke="black" stroke-width="1" fill="red" d="M 0 10 L 20 0 L 20 7 L 120 7 L 124 2 L 140 2 ' +
			'L 136 10 L 140 18 L 124 18 L 120 13 L 20 13 L 20 20 Z">';
	};
	
	exports.go = function () {
		return '<path fill-rule="evenodd" stroke="black" stroke-width="1" fill="red" d="M 0 0 L 0 20 L 16 20 ' +
			'L 16 8 L 6 8 L 6 12 L 12 12 ' +
			'L 12 16 L 4 16 L 4 4 L 16 4 L 16 0 Z M 20 0 L 20 20 L 36 20 L 36 0 L 20 0 M 24 4 L 24 16 L 32 16 ' +
			'L 32 4 Z">';
	};
}());
},{}],43:[function(require,module,exports){
(function () {
    'use strict';
	
	var precondition = require('./contract').precondition;

    exports.wrap = function (container, text, fontSize, y, width) {
		precondition(container);
		precondition(_.isString(text));
		precondition(_.isNumber(fontSize));
		precondition(_.isNumber(y));
		precondition(_.isNumber(width));
		
		var textElement = container.append('text')
			.attr({
				x: 0,
				y: y,
				'font-size': fontSize
			});
			
		var words = text.split(' ');
		var line = [];
		var lineNumber = 0;
		var lineHeight = 1.4; // ems
		var margin = 4;
		
		var tspan = textElement.append('tspan');

		while (words.length > 0) {
			var word = words[0];
			line.push(word);
			tspan.text(line.join(" "));

			if (tspan.node().getComputedTextLength() > (width - 2 * margin)) {
				line.pop();
				tspan
					.text(line.join(" "))
					.attr("x", (width - tspan.node().getComputedTextLength()) / 2)
					.attr("dy", (lineNumber > 0 ? 1 : 0) * lineHeight + "em");
				line = [];

				lineNumber += 1;

				tspan = textElement.append("tspan");
			} else {
				words.shift();
			}
		}
		
		if (line.length > 0) {
			tspan
				.text(line.join(" "))
				.attr("x", (width - tspan.node().getComputedTextLength()) / 2)
				.attr("dy", (lineNumber > 0 ? 1 : 0) * lineHeight + "em");
		}
    };
}());
},{"./contract":10}],44:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var GameState = require('./game-state');
	var TradeOffer = require('./trade-offer');
	var Player = require('./player');
	
	exports.newChoice = function (player) {
		precondition(Player.isPlayer(player), 'A TradeChoice requires a player to trade with');
		
		return new TradeChoice(player);
	};
	
	function TradeChoice(player) {
		this.id = 'trade-with-' + player.id();
		this.name = i18n.CHOICE_TRADE.replace('{player}', player.name());
		this._player = player;
	}
	
	TradeChoice.prototype.equals = function (other) {
		if (!(other instanceof TradeChoice)) {
			return false;
		}
		
		return this._player.equals(other._player);
	};
	
	TradeChoice.prototype.requiresDice = function () {
		return false;
	};
	
	TradeChoice.prototype.requiresTrade = function () {
		return true;
	};
	
	TradeChoice.prototype.otherPlayer = function () {
		return this._player;
	};
	
	TradeChoice.prototype.computeNextState = function (state, offer) {
		precondition(GameState.isGameState(state),
			'TradeChoice requires a game state to compute the next one');
		precondition(TradeOffer.isOffer(offer), 'TradeChoice requires a game offer');
		
		if (offer.isEmpty()) {
			return state;
		}
		
		return GameState.gameInTradeState(state.board(), state.players(), offer);
	};
}());
},{"./contract":10,"./game-state":16,"./i18n":24,"./player":35,"./trade-offer":45}],45:[function(require,module,exports){
(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	var Player = require('./player');
	
	exports.isOffer = function (candidate) {
		return candidate instanceof TradeOffer;
	};
	
	exports.emptyOffer = function () {
		return new TradeOffer([
			{
				properties: [],
				money: 0
			},
			{
				properties: [],
				money: 0
			}
		]);
	};
	
	exports.newOffer = function (info) {
		precondition(Player.isPlayer(info[0].player),
			'A TradeOffer requires the current player');
		precondition(_.isArray(info[0].properties),
			'A TradeOffer requires a list of properties for the current player');
		precondition(_.isNumber(info[0].money),
			'A TradeOffer requires an amount of money for the current player');
		precondition(propertiesOwnedBy(info[0].properties, info[0].player),
			'Properties offered by current player must be owned by current player');
			
		info[0].properties = realProperties(info[0].properties, info[0].player);
			
		precondition(Player.isPlayer(info[1].player),
			'A TradeOffer requires the other player');
		precondition(_.isArray(info[1].properties),
			'A TradeOffer requires a list of properties for the other player');
		precondition(_.isNumber(info[1].money),
			'A TradeOffer requires an amount of money for the other player');
		precondition(propertiesOwnedBy(info[1].properties, info[1].player),
			'Properties offered by other player must be owned by other player');
			
		info[1].properties = realProperties(info[1].properties, info[1].player);
		
		return new TradeOffer(info);
	};
	
	function propertiesOwnedBy(propertyIds, player) {
		return _.every(propertyIds, function (propertyId) {
			return !!_.find(player.properties(), function (property) {
				return property.id() === propertyId;
			});
		});
	}
	
	function realProperties(propertyIds, player) {
		return _.map(propertyIds, function (propertyId) {
			return _.find(player.properties(), function (property) {
				return property.id() === propertyId;
			});
		});
	}
	
	function TradeOffer(info) {
		this._currentPlayer = info[0].player;
		this._currentPlayerProperties = info[0].properties;
		this._currentPlayerMoney = info[0].money;
		this._otherPlayer = info[1].player;
		this._otherPlayerProperties = info[1].properties;
		this._otherPlayerMoney = info[1].money;
	}
	
	TradeOffer.prototype.isEmpty = function () {
		return this._currentPlayerProperties.length === 0 && this._currentPlayerMoney === 0 &&
			this._otherPlayerProperties.length === 0 && this._otherPlayerMoney === 0;
	};
	
	TradeOffer.prototype.isValid = function () {
		var currentPlayerOfferValid = (this._currentPlayerProperties.length > 0 || this._currentPlayerMoney > 0);
		var otherPlayerOfferValid = (this._otherPlayerProperties.length > 0 || this._otherPlayerMoney > 0);
		
		return currentPlayerOfferValid && otherPlayerOfferValid;
	};
	
	TradeOffer.prototype.currentPlayerId = function () {
		return this._currentPlayer.id();
	};
	
	TradeOffer.prototype.otherPlayerId = function () {
		return this._otherPlayer.id();
	};
	
	TradeOffer.prototype.propertiesFor = function (playerIndex) {
		return (playerIndex === 0) ? this._currentPlayerProperties.slice() : this._otherPlayerProperties.slice();
	};
	
	TradeOffer.prototype.moneyFor = function (playerIndex) {
		return (playerIndex === 0) ? this._currentPlayerMoney : this._otherPlayerMoney;
	};
	
	TradeOffer.prototype.equals = function (other) {
		if (!(other instanceof TradeOffer)) {
			return false;
		}
		
		if (this._currentPlayer.id() !== other._currentPlayer.id()) {
			return false;
		}
		
		if (this._otherPlayer.id() !== other._otherPlayer.id()) {
			return false;
		}
		
		if (this._currentPlayerMoney !== other._currentPlayerMoney) {
			return false;
		}
		
		if (this._otherPlayerMoney !== other._otherPlayerMoney) {
			return false;
		}
		
		if (!sameProperties(this._currentPlayerProperties, other._currentPlayerProperties)) {
			return false;
		}
		
		if (!sameProperties(this._otherPlayerProperties, other._otherPlayerProperties)) {
			return false;
		}
		
		return true;
	};
	
	function sameProperties(left, right) {
		if (left.length !== right.length) {
			return false;
		}
		
		return _.every(left, function (property, index) {
			return property.id() === right[index].id();
		});
	}
}());
},{"./contract":10,"./player":35}],46:[function(require,module,exports){
(function() {
	"use strict";
	
	var Player = require('./player');
	var TradeOffer = require('./trade-offer');
	
	var precondition = require('./contract').precondition;
	
	exports.start = function (currentPlayer, otherPlayer) {
		precondition(Player.isPlayer(currentPlayer), 'A TradeTask requires a current player');
		precondition(Player.isPlayer(otherPlayer), 'A TradeTask requires another player');
		
		return new TradeTask(currentPlayer, otherPlayer);
	};
	
	function TradeTask(currentPlayer, otherPlayer) {
		this._currentPlayer = currentPlayer;
		this._otherPlayer = otherPlayer;
		this._currentPlayerPropertiesOffer = [];
		this._otherPlayerPropertiesOffer = [];
		this._currentPlayerMoneyOffer = 0;
		this._otherPlayerMoneyOffer = 0;
		
		this._offer = new Rx.BehaviorSubject(currentOffer(this));
	}
	
	TradeTask.prototype.currentPlayer = function () {
		return this._currentPlayer;
	};
	
	TradeTask.prototype.otherPlayer = function () {
		return this._otherPlayer;
	};
	
	TradeTask.prototype.togglePropertyOfferedByPlayer = function (propertyId, playerIndex) {
		precondition(_.isString(propertyId), 'Requires a property id');
		precondition(_.isNumber(playerIndex) && (playerIndex === 0 || playerIndex === 1),
			'Only the player with index 0 or 1 can offer something');
			
		var properties = (playerIndex === 0) ?
			this._currentPlayerPropertiesOffer :
			this._otherPlayerPropertiesOffer;
		
		if (_.contains(properties, propertyId)) {
			properties = _.without(properties, propertyId);
		} else {
			properties = properties.concat([propertyId]);
		}
		
		setPropertiesOfferFor(playerIndex, properties, this);
		
		this._offer.onNext(currentOffer(this));
	};
	
	function setPropertiesOfferFor(playerIndex, properties, self) {
		if (playerIndex === 0) {
			self._currentPlayerPropertiesOffer = properties;
		} else {
			self._otherPlayerPropertiesOffer = properties;
		}
	}
	
	TradeTask.prototype.setMoneyOfferedByPlayer = function (money, playerIndex) {
		precondition(_.isNumber(money) && money >= 0,
			'A player can only offer an amount of money greater than or equal to 0');
		precondition(_.isNumber(playerIndex) && (playerIndex === 0 || playerIndex === 1),
			'Only the player with index 0 or 1 can offer something');
			
		if (playerIndex === 0) {
			precondition(money <= this._currentPlayer.money(),
				'A player cannot offer more money than he has');
			
			this._currentPlayerMoneyOffer = money;
		} else {
			precondition(money <= this._otherPlayer.money(),
				'A player cannot offer more money than he has');
				
			this._otherPlayerMoneyOffer = money;
		}
		
		this._offer.onNext(currentOffer(this));
	};
	
	TradeTask.prototype.makeOffer = function () {
		this._offer.onCompleted();
	};
	
	TradeTask.prototype.cancel = function () {
		this._offer.onNext(TradeOffer.emptyOffer());
		this._offer.onCompleted();
	};
	
	TradeTask.prototype.offer = function () {
		return this._offer.asObservable();
	};
	
	function currentOffer(self) {
		return TradeOffer.newOffer([
			{
				player: self._currentPlayer,
				properties: self._currentPlayerPropertiesOffer,
				money: self._currentPlayerMoneyOffer
			},
			{
				player: self._otherPlayer,
				properties: self._otherPlayerPropertiesOffer,
				money: self._otherPlayerMoneyOffer
			}
		]);
	}
}());
},{"./contract":10,"./player":35,"./trade-offer":45}],47:[function(require,module,exports){
(function() {
	"use strict";

	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, tradeTask) {
		precondition(container, 'A TradeWidget requires a container to render into');
		precondition(tradeTask, 'A Tradewidget requires a TradeTask');
			
		var dialog = renderDialog(container[0], tradeTask);
			
		tradeTask.offer().subscribeOnCompleted(function () {
			dialog.remove();
		});
		
		$(dialog[0]).modal({
			'backdrop': 'static',
			'keyboard': false
		});		
		$(dialog[0]).modal('show');
	};
	
	function renderDialog(container, tradeTask) {
		var dialog = d3.select(container).append('div')
			.attr({
				'tabindex': '-1',
				'role': 'dialog'
			})
			.classed({
				'modal': true,
				'fade': true,
				'monopoly-trade-panel': true
			});
			
		var dialogContent = dialog
			.append('div')
			.attr('role', 'document')
			.classed('modal-dialog', true)
			.append('div')
			.classed('modal-content', true);
			
		dialogContent.append('div')
			.classed('modal-header', true)
			.append('h4')
			.attr('id', 'trade-title')
			.classed('modal-title', true)
			.text(i18n.TRADE_TITLE);
			
		var modalBody = dialogContent.append('div')
			.classed('modal-body', true);
		
		renderPlayerPanel(modalBody, tradeTask.currentPlayer(), tradeTask, 0);
		renderPlayerPanel(modalBody, tradeTask.otherPlayer(), tradeTask, 1);
		
		modalBody.append('div')
			.classed('clearfix', true);
		
		var modalFooter = dialogContent.append('div')
			.classed('modal-footer', true);
		
		renderCancelTradeButton(modalFooter, tradeTask);
		renderMakeOfferButton(modalFooter, tradeTask);
		
		return dialog;
	}
	
	function renderCancelTradeButton(container, tradeTask) {
		container.append('button')
			.attr({
				'type': 'button',
				'data-dismiss': 'modal',
				'data-ui': 'cancel-trade-btn'
			})
			.classed({
				'btn': true,
				'btn-default': true
			})
			.text(i18n.TRADE_CANCEL)
			.on('click', function () {
				tradeTask.cancel();
			});
	}
	
	function renderMakeOfferButton(container, tradeTask) {
		var makeOfferBtn = container.append('button')
			.attr({
				'type': 'button',
				'data-dismiss': 'modal',
				'data-ui': 'make-offer-btn'
			})
			.classed({
				'btn': true,
				'btn-primary': true
			})
			.text(i18n.TRADE_MAKE_OFFER)
			.on('click', function () {
				tradeTask.makeOffer();
			});
			
		tradeTask.offer()
			.map(function (offer) {
				return offer.isValid();
			})
			.subscribe(function (valid) {
				makeOfferBtn.attr('disabled', valid ? null : 'disabled');
			});
	}
	
	function renderPlayerPanel(container, player, tradeTask, playerIndex) {
		var panel = container.append('div')
			.classed('monopoly-trade-player-panel', true)
			.attr('data-ui', player.id());
			
		panel.append('span')
			.classed('monopoly-trade-player-name', true)
			.text(player.name());
			
		var list = panel.append('div')
			.classed('monopoly-trade-player-properties', true);
			
		tradeTask.offer()
			.map(function (offer) {
				return offer.propertiesFor(playerIndex);
			})
			.distinctUntilChanged()
			.subscribe(function (selectedProperties) {
				var items = list.selectAll('.monopoly-trade-player-property')
					.data(player.properties());
					
				items.enter()
					.append('button')
					.classed('monopoly-trade-player-property', true)
					.text(function (property) {
						return property.name();
					})
					.style('background-color', function (property) {
						return property.group().color();
					})
					.on('click', function (property) {
						tradeTask.togglePropertyOfferedByPlayer(property.id(), playerIndex);
					});
					
				items.classed('monopoly-trade-player-property-selected', function (property) {
					var propertyIds = _.map(selectedProperties, function (property) {
						return property.id();
					});
					
					return _.contains(propertyIds, property.id());
				});
			});
		
		panel.append('input')
			.attr('type', 'text')
			.classed('monopoly-trade-player-money-spinner', true)
			.each(function () {
				$(this).spinner({
					min: 0, max: player.money(), step: 1,
					change: onMoneySpinnerChange(tradeTask, playerIndex),
					stop: onMoneySpinnerChange(tradeTask, playerIndex)
				})
				.val(0)
				.on('input', function () {
					if ($(this).data('onInputPrevented')) {
						return;
					}
					var val = this.value;
					var $this = $(this);
					var max = $this.spinner('option', 'max');
					var min = $this.spinner('option', 'min');
					// We want only number, no alpha. 
					// We set it to previous default value.         
					if (!val.match(/^[+-]?[\d]{0,}$/)) {
						val = $(this).data('defaultValue');
					}
					this.value = val > max ? max : val < min ? min : val;
				}).on('keydown', function (e) {
					// we set default value for spinner.
					if (!$(this).data('defaultValue')) {
						$(this).data('defaultValue', this.value);
					}
					// To handle backspace
					$(this).data('onInputPrevented', e.which === 8 ? true : false);
				});
			});
			
		panel.append('span')
			.classed('monopoly-trade-player-money-total', true)
			.text('/ ' + i18n.formatPrice(player.money()));
	}
	
	function onMoneySpinnerChange(task, playerIndex) {
		return function (event, ui) {
			task.setMoneyOfferedByPlayer($(event.target).spinner('value'), playerIndex);
		};
	}
}());

},{"./contract":10,"./i18n":24}],48:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var GameState = require('./game-state');
	
	var precondition = require('./contract').precondition;
	
	exports.newChoice = function() {
		return new TryDoubleRollChoice();
	};
	
	function TryDoubleRollChoice() {
		this.id = 'try-double-roll';
		this.name = i18n.CHOICE_TRY_DOUBLE_ROLL;
	}
	
	TryDoubleRollChoice.prototype.equals = function (other) {
		return (other instanceof TryDoubleRollChoice);
	};
	
	TryDoubleRollChoice.prototype.requiresDice = function () {
		return true;
	};
	
	TryDoubleRollChoice.prototype.computeNextState = function (state, dice) {
		precondition(GameState.isGameState(state),
			'TryDoubleRollChoice requires a game state to compute the next one');
		precondition(dice,
			'TryDoubleRollChoice requires the result of a dice roll to compute the next state');
			
		if (dice[0] !== dice[1]) {
			return GameState.turnEndState({
				board: state.board(),
				players: state.players(),
				currentPlayerIndex: state.currentPlayerIndex()
			});
		}
		
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return player.unjail().move(dice);
			}
			
			return player;
		});
			
		return GameState.turnEndState({
			board: state.board(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex()
		});
	};
}());
},{"./contract":10,"./game-state":16,"./i18n":24}]},{},[4]);
