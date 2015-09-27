(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
			var rows = squaresToRows(state.squares());
			
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
				.data(state.squares())
				.each(function (square, index) {
					var graphicalSquare = d3.select(this);
					graphicalSquare.attr('data-ui', index);
					renderPlayerTokens(graphicalSquare, index, state.players());
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
	
	function renderSquare(container, square, players) {
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
			},
			'luxury-tax': function (name) {
				writeText(container, name, 14);
				writeText(container, i18n.LUXURY_TAX_DESCRIPTION, SQUARE_HEIGHT - 8, 10);
			},
			'company': renderCompany(container),
			'go': renderStart(container),
			'jail': renderJail(container),
			'go-to-jail': _.noop,
			'parking': _.noop
		});
	}
	
	function renderPlayerTokens(container, squareIndex, players) {
		var playersOnSquare = _.filter(players, function (player) {
			return player.position() === squareIndex;
		});
		
		var tokens = container.selectAll('.player-token')
			.data(playersOnSquare);
			
		tokens
			.enter()
			.append('circle')
			.classed('player-token', true)
			.attr('data-ui', function (player) {
				return player.id();
			})
			.attr({
				cx: function (_, index) {
					return (SQUARE_WIDTH / 5) * (index % 4 + 1);
				},
				cy: function (_, index) {
					return (SQUARE_HEIGHT / 3) * (Math.floor(index / 4) + 1);
				},
				r: 8,
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
		};
	}
	
	function renderRailroad(container) {
		return function (_, name, price) {
			container.append('g')
				.attr('transform', 'scale(0.2) translate(50, 140)')
				.html(Symbols.train());
				
			writeText(container, name, 14);
			writePrice(container, price);
		};
	}
	
	function renderStart(container) {
		return function () {
			container.append('g')
				.attr('transform', 'scale(0.6) translate(6, 134)')
				.html(Symbols.arrow());
		};
	}
	
	function renderCompany(container) {
		return function (_, name, price) {
			writeText(container, name, 14);
			writePrice(container, price);
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
		};
	}
	
	function writeText(container, text, y, fontSize) {
		TextWrapper.wrap(container, text.toUpperCase(), fontSize || 8, y, SQUARE_WIDTH);
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
},{"./contract":7,"./i18n":20,"./symbols":36,"./text-wrapper":37}],2:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var Property = require('./property');
	var PropertyGroup = require('./property-group');
	
	function groupMembers(groupIndex) {
		precondition(_.isNumber(groupIndex) && groupIndex >= 0 && groupIndex < 10,
			'Listing members of a group in board requires the group index');
		
		return _.filter(exports.properties(), function (square) {
			return square.group().index() === groupIndex;
		});
	}
	
	exports.properties = function () {
		var groups = [
			PropertyGroup.newGroup(0, 'midnightblue', groupMembers),
			PropertyGroup.newGroup(1, 'lightskyblue', groupMembers),
			PropertyGroup.newGroup(2, 'mediumvioletred', groupMembers),
			PropertyGroup.newGroup(3, 'orange', groupMembers),
			PropertyGroup.newGroup(4, 'red', groupMembers),
			PropertyGroup.newGroup(5, 'yellow', groupMembers),
			PropertyGroup.newGroup(6, 'green', groupMembers),
			PropertyGroup.newGroup(7, 'blue', groupMembers)
		];
		
		var railroadGroup = PropertyGroup.newGroup(8, 'black', groupMembers);
		var companyGroup =  PropertyGroup.newGroup(9, 'lightgreen', groupMembers);
		
		return {
			mediterranean: 	Property.newEstate('md', i18n.PROPERTY_MD, groups[0], { value: 60,  rent: 2}),
			baltic:			Property.newEstate('bt', i18n.PROPERTY_BT, groups[0], { value: 60,  rent: 4}),
			east:			Property.newEstate('et', i18n.PROPERTY_ET, groups[1], { value: 100, rent: 6}),
			vermont:		Property.newEstate('vt', i18n.PROPERTY_VT, groups[1], { value: 100, rent: 6}),
			connecticut:	Property.newEstate('cn', i18n.PROPERTY_CN, groups[1], { value: 120, rent: 8}),
			charles:		Property.newEstate('cl', i18n.PROPERTY_CL, groups[2], { value: 140, rent: 10}),
			us:				Property.newEstate('us', i18n.PROPERTY_US, groups[2], { value: 140, rent: 10}),
			virginia:		Property.newEstate('vn', i18n.PROPERTY_VN, groups[2], { value: 160, rent: 12}),
			jack:			Property.newEstate('jk', i18n.PROPERTY_JK, groups[3], { value: 180, rent: 14}),
			tennessee:		Property.newEstate('tn', i18n.PROPERTY_TN, groups[3], { value: 180, rent: 14}),
			newYork:		Property.newEstate('ny', i18n.PROPERTY_NY, groups[3], { value: 200, rent: 16}),
			kentucky:		Property.newEstate('kt', i18n.PROPERTY_KT, groups[4], { value: 220, rent: 18}),
			indiana:		Property.newEstate('in', i18n.PROPERTY_IN, groups[4], { value: 220, rent: 18}),
			illinois:		Property.newEstate('il', i18n.PROPERTY_IL, groups[4], { value: 240, rent: 20}),
			atlantic:		Property.newEstate('at', i18n.PROPERTY_AT, groups[5], { value: 260, rent: 22}),
			ventnor:		Property.newEstate('vr', i18n.PROPERTY_VR, groups[5], { value: 260, rent: 22}),
			marvin:			Property.newEstate('mv', i18n.PROPERTY_MN, groups[5], { value: 280, rent: 24}),
			pacific:		Property.newEstate('pa', i18n.PROPERTY_PA, groups[6], { value: 300, rent: 26}),
			northCarolina:	Property.newEstate('nc', i18n.PROPERTY_NC, groups[6], { value: 300, rent: 26}),
			pennsylvania:	Property.newEstate('pn', i18n.PROPERTY_PN, groups[6], { value: 320, rent: 28}),
			park:			Property.newEstate('pk', i18n.PROPERTY_PK, groups[7], { value: 350, rent: 35}),
			broadwalk:		Property.newEstate('bw', i18n.PROPERTY_BW, groups[7], { value: 400, rent: 50}),
			
			readingRailroad:		Property.newRailroad('rr-reading', i18n.RAILROAD_READING, railroadGroup),
			pennsylvaniaRailroad:	Property.newRailroad('rr-penn', i18n.RAILROAD_PENN, railroadGroup),
			boRailroad:				Property.newRailroad('rr-bo', i18n.RAILROAD_B_O, railroadGroup),
			shortRailroad:			Property.newRailroad('rr-short', i18n.RAILROAD_SHORT, railroadGroup),
			
			electricCompany:	Property.newCompany('electric', i18n.COMPANY_ELECTRIC, companyGroup),
			waterWorks:			Property.newCompany('water', i18n.COMPANY_WATER, companyGroup)
		};
	};
	
	exports.squares = function () {
		var properties = exports.properties();
		
		return [
			go(),
			properties.mediterranean,
			communityChest(),
			properties.baltic,
			incomeTax(),
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
			luxuryTax(),
			properties.broadwalk
		];
	};
	
	function go() {
		return {
			match: match('go')
		};
	}
	
	function jail() {
		return {
			match: match('jail')
		};
	}
	
	function parking() {
		return {
			match: match('parking')
		};
	}
	
	function goToJail() {
		return {
			match: match('go-to-jail')
		};
	}
	
	function communityChest() {
		return {
			match: match('community-chest', [i18n.COMMUNITY_CHEST])
		};
	}
	
	function chance() {
		return {
			match: match('chance', [i18n.CHANCE])
		};
	}
	
	function incomeTax() {
		return {
			match: match('income-tax', [i18n.INCOME_TAX])
		};
	}
	
	function luxuryTax() {
		return {
			match: match('luxury-tax', [i18n.LUXURY_TAX])
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
}());
},{"./contract":7,"./i18n":20,"./property":33,"./property-group":32}],3:[function(require,module,exports){
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


},{"./fail-fast":9,"./game-task":14,"./game-widget":15}],4:[function(require,module,exports){
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
		
		var self = this;
		return other.match({
			'buy-property': function (property) {
				return self._property.equals(property);
			}
		});
	};
	
	BuyPropertyChoice.prototype.match = function (visitor) {
		return visitor[this.id](this._property);
	};
	
	BuyPropertyChoice.prototype.requiresDice = function () {
		return false;
	};
	
	BuyPropertyChoice.prototype.computeNextState = function (state) {
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
			squares: state.squares(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex()
		});
	}
}());
},{"./contract":7,"./game-state":13,"./i18n":20,"./property":33}],5:[function(require,module,exports){
(function() {
	"use strict";
	
	var RollDiceChoice = require('./roll-dice-choice');
	var FinishTurnChoice = require('./finish-turn-choice');
	var BuyPropertyChoice = require('./buy-property-choice');
	var PayRentChoice = require('./pay-rent-choice');
	var GoBankruptChoice = require('./go-bankrupt-choice');
	var PayTaxChoice = require('./pay-tax-choice');

	exports.rollDice = function () {
		return RollDiceChoice.newChoice();
	};
	
	exports.finishTurn = function () {
		return FinishTurnChoice.newChoice();
	};
	
	exports.buyProperty = function (property) {
		return BuyPropertyChoice.newChoice(property);
	};
	
	exports.payRent = function (rent, toPlayerId, toPlayerName) {
		return PayRentChoice.newChoice(rent, toPlayerId, toPlayerName);
	};
	
	exports.goBankrupt = function () {
		return GoBankruptChoice.newChoice();
	};
	
	exports.payTax = function (amount) {
		return PayTaxChoice.newChoice(amount);
	};
}());
},{"./buy-property-choice":4,"./finish-turn-choice":10,"./go-bankrupt-choice":16,"./pay-rent-choice":25,"./pay-tax-choice":26,"./roll-dice-choice":34}],6:[function(require,module,exports){
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
		return this._playerSlots.asObservable().takeUntil(this._completed);
	};
	
	ConfigureGameTask.prototype.configurationValid = function () {
		return this._configurationValid.asObservable();
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
		return this._canAddPlayerSlot.asObservable();
	};
	
	ConfigureGameTask.prototype.startGame = function () {
		this._completed.onNext(true);
		this._completed.onCompleted();
	};
	
	ConfigureGameTask.prototype.completed = function () {
		return this._completed.asObservable();
	};
}());
},{"./contract":7}],7:[function(require,module,exports){
(function() {
	"use strict";
	
	exports.precondition = function (check, message) {
        if (check) {
            return;
        }
        throw new Error("Precondition: " + message);
    };
}());
},{}],8:[function(require,module,exports){
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
},{"./contract":7}],9:[function(require,module,exports){
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
},{}],10:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var GameState = require('./game-state');
	
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
	
	FinishTurnChoice.prototype.match = function (visitor) {
		return visitor[this.id]();
	};
	
	FinishTurnChoice.prototype.requiresDice = function () {
		return false;
	};
	
	FinishTurnChoice.prototype.computeNextState = function (state) {
		return GameState.turnStartState({
			squares: state.squares(),
			players: state.players(),
			currentPlayerIndex: (state.currentPlayerIndex() + 1) % state.players().length
		});
	};
}());
},{"./game-state":13,"./i18n":20}],11:[function(require,module,exports){
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
},{"./contract":7}],12:[function(require,module,exports){
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
			.takeUntil(configureGameTask.completed())
			.subscribe(function (canAdd) {
				emptyBlock.style('display', (canAdd ? null : 'none'));
			});
		
		
		configureGameTask.playerSlots()
			.takeUntil(configureGameTask.completed())
			.subscribe(function (slots) {
				var slotsSelection = activeSlotsContainer
					.selectAll('.player-slot')
					.data(slots);
					
				createNewSlots(slotsSelection, configureGameTask);
				updateSlots(slotsSelection);
				removeUnneededSlots(slotsSelection);
			});
		
		var startButton = panel.append('button')
			.classed('btn-start-game', true)
			.text(i18n.BUTTON_START_GAME)
			.on('click', function () {
				configureGameTask.startGame();
			});
			
		configureGameTask.configurationValid()
			.takeUntil(configureGameTask.completed())
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
},{"./contract":7,"./i18n":20,"./popup":31}],13:[function(require,module,exports){
(function() {
	"use strict";
	
	var Choices = require('./choices');
	
	var precondition = require('./contract').precondition;
	
	exports.gameFinishedState = function (squares, winner) {
		precondition(_.isArray(squares) && squares.length === 40,
			'GameFinishedState requires an array of 40 squares');
		precondition(winner, 'GameFinishedState requires a winner');
		
		return new GameState({
			squares: squares,
			players: [winner],
			currentPlayerIndex: 0
		}, []);
	};
	
	exports.turnStartState = function (info) {
		validateInfo(info);
			
		var choices = newTurnChoices();
		
		return new GameState(info, choices);
	};
	
	function newTurnChoices() {
		return [Choices.rollDice()];
	}
	
	exports.turnEndState = function (info, paid) {
		validateInfo(info);
			
		var choices = turnEndChoices(info, paid || false);
		
		return new GameState(info, choices);
	};
	
	function turnEndChoices(info, paid) {
		var currentPlayer = info.players[info.currentPlayerIndex];
		var currentSquare = info.squares[currentPlayer.position()];
		var choices = choicesForSquare(currentSquare, info.players, currentPlayer, paid);
			
		return choices;
	}
	
	function choicesForSquare(square, players, currentPlayer, paid) {
		return square.match({
			'estate': choicesForProperty(square, players, currentPlayer, paid),
			'railroad': choicesForProperty(square, players, currentPlayer, paid),
			'company': choicesForProperty(square, players, currentPlayer, paid),
			'luxury-tax': payLuxuryTax(currentPlayer, paid),
			_: onlyFinishTurn
		});
	}
	
	function payLuxuryTax(currentPlayer, paid) {
		return function () {
			if (!paid) {
				if (currentPlayer.money() < 75) {
					return [Choices.goBankrupt()];
				}

				return [Choices.payTax(75)];
			}
			
			return [Choices.finishTurn()];
		};
	}
	
	function onlyFinishTurn() {
		return [Choices.finishTurn()];
	}
	
	function choicesForProperty(square, players, currentPlayer, paid) {
		return function (id, name, price) {
			var owner = getOwner(players, square);
			
			if (!paid && owner && owner.id() !== currentPlayer.id()) {
				var rent = square.rent(owner.properties());
				if (currentPlayer.money() <= rent) {
					return [Choices.goBankrupt()];
				}
				
				return [Choices.payRent(rent, owner)];
			}
			
			if (!owner && currentPlayer.money() > price) {
				return [Choices.buyProperty(square), Choices.finishTurn()];
			}
			
			return [Choices.finishTurn()];
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
		precondition(_.isArray(info.squares) && info.squares.length === 40,
			'GameState requires an array of 40 squares');
		precondition(_.isArray(info.players) && info.players.length >= 2,
			'GameState requires an array of at least 2 players');
		precondition(_.isNumber(info.currentPlayerIndex) && validIndex(info.players, info.currentPlayerIndex),
			'GameState requires the index of the current player');
	}
	
	function validIndex(array, index) {
		return index >= 0 && index < array.length;
	}
	
	function GameState(info, choices) {
		this._squares = info.squares;
		this._players = info.players;
		this._currentPlayerIndex = info.currentPlayerIndex;
		this._choices = choices;
	}
	
	GameState.prototype.squares = function () {
		return this._squares;
	};
	
	GameState.prototype.players = function () {
		return this._players;
	};
	
	GameState.prototype.currentPlayerIndex = function () {
		return this._currentPlayerIndex;
	};
	
	GameState.prototype.choices = function () {
		return this._choices;
	};
}());
},{"./choices":5,"./contract":7}],14:[function(require,module,exports){
(function() {
	"use strict";
	
	var Board = require('./board');
	var PlayGameTask = require('./play-game-task');
	var ConfigureGameTask = require('./configure-game-task');
	
	exports.start = function () {
		return new GameTask();
	};

	function GameTask() {
		this._statusChanged = new Rx.ReplaySubject(1);
		this._statusChanged.onNext(configuringStatus(this._statusChanged));
	}
	
	function configuringStatus(statusChanged) {
		var task = ConfigureGameTask.start();
		task.playerSlots().last()
			.subscribe(function (players) {
				startGame(players, statusChanged);
			});
		
		return {
			statusName: 'configuring',
			match: function (visitor) {
				visitor.configuring(task);
			}
		};
	}
	
	function playingStatus(players, statusChanged) {
		var gameConfiguration = { squares: Board.squares(), players: players, options: { fastDice: false }};
		var task = PlayGameTask.start(gameConfiguration);
		task.completed().subscribe(function () {
			newGame(statusChanged);
		});
				
		return {
			statusName: 'playing',
			match: function (visitor) {
				visitor.playing(task);
			}
		};
	}
	
	function newGame(statusChanged) {
		statusChanged.onNext(configuringStatus(statusChanged));
	}
	
	function startGame(players, statusChanged) {
		statusChanged.onNext(playingStatus(players, statusChanged));
	}
	
	GameTask.prototype.statusChanged = function () {
		return this._statusChanged.asObservable();
	};
}());
},{"./board":2,"./configure-game-task":6,"./play-game-task":27}],15:[function(require,module,exports){
(function() {
	"use strict";
	
	var GameConfigurationWidget = require('./game-configuration-widget');
	var MonopolyGameWidget = require('./monopoly-game-widget');
	
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, gameTask) {
		precondition(container, 'A Game widget requires a container to render into');
		precondition(gameTask, 'A Game widget requires a game task');
		
		gameTask.statusChanged().subscribe(function (status) {
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
},{"./contract":7,"./game-configuration-widget":12,"./monopoly-game-widget":24}],16:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	
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
	
	GoBankruptChoice.prototype.match = function (visitor) {
		return visitor[this.id]();
	};
	
	GoBankruptChoice.prototype.requiresDice = function () {
		return false;
	};
	
	GoBankruptChoice.prototype.computeNextState = function (state) {
		return goBankruptNextState(state);
	};
	
	function goBankruptNextState(state) {
		var newPlayers = _.filter(state.players(), function (player, index) {
			return index !== state.currentPlayerIndex();
		});
		
		if (newPlayers.length === 1) {
			return GameState.gameFinishedState(state.squares(), newPlayers[0]);
		}
		
		var newPlayerIndex = state.currentPlayerIndex() % newPlayers.length;
		
		return GameState.turnStartState({
			squares: state.squares(),
			players: newPlayers,
			currentPlayerIndex: newPlayerIndex
		});
	}
}());
},{"./game-state":13,"./i18n":20}],17:[function(require,module,exports){
(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.start = function (playGameTask) {
		precondition(playGameTask, 'HandleChoicesTask requires a PlayGameTask');
		
		var humanChoices = new Rx.ReplaySubject(1);
		choicesForPlayerType(playGameTask, 'human')
			.subscribe(humanChoices);
		
		var task = new HandleChoicesTask(humanChoices);
		
		choicesForPlayerType(playGameTask, 'computer')
			.filter(function (choices) {
				return choices.length > 0;
			})
			.map(computerPlayer)
			.subscribe(applyChoice(task));
			
		return task;
	};
	
	function HandleChoicesTask(humanChoices) {
		this._humanChoices = humanChoices;
		this._choiceMade = new Rx.Subject();
	}
	
	HandleChoicesTask.prototype.choices = function () {
		return this._humanChoices.asObservable();
	};
	
	HandleChoicesTask.prototype.choiceMade = function () {
		return this._choiceMade.asObservable();
	};
	
	HandleChoicesTask.prototype.makeChoice = function (choice) {
		this._humanChoices.onNext([]);
		this._choiceMade.onNext(choice);
	};
	
	function choicesForPlayerType(playGameTask, type) {
		return playGameTask.gameState()
			.filter(function (state) {
				return state.players()[state.currentPlayerIndex()].type() === type;
			})
			.map(function (state) {
				return state.choices();
			})
			.takeUntil(playGameTask.completed());
	}
	
	function computerPlayer(choices) {
		return choices[0];
	}
	
	function applyChoice(task) {
		return function (choice) {
			Rx.Observable.timer(0).subscribe(function () {
				task._choiceMade.onNext(choice);
			});
		};
	}
}());
},{"./contract":7}],18:[function(require,module,exports){
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
	exports.LUXURY_TAX_DESCRIPTION = "Pay $75";
	
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
}());
},{}],19:[function(require,module,exports){
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
	
	// Log messages
	exports.LOG_DICE_ROLL = '{player} a obtenu un {die1} et un {die2}';
	exports.LOG_DOUBLE_DICE_ROLL = '{player} a obtenu un doublé de {dice}';
	exports.LOG_PROPERTY_BOUGHT = '{player} a acheté {property}';
	exports.LOG_RENT_PAID = '{fromPlayer} a payé {amount} à {toPlayer}';
	exports.LOG_SALARY = "{player} a passé GO et reçu $200";
	exports.LOG_TAX_PAID = "{player} a payé une taxe de {amount}";
	
	// Squares
	exports.CHANCE = 'Chance';
	exports.COMMUNITY_CHEST = 'Caisse commune';
	exports.INCOME_TAX = 'Impôt sur le revenu';
	exports.LUXURY_TAX = 'Taxe de luxe';
	exports.LUXURY_TAX_DESCRIPTION = "Payez 75$";
	
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
}());
},{}],20:[function(require,module,exports){
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
},{"./i18n.en":18,"./i18n.fr":19}],21:[function(require,module,exports){
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
		onDiceRolled(playGameTask)
			.takeUntil(playGameTask.completed())
			.subscribe(function (dice) {
				messages.onNext(diceMessage(dice));
			});
			
		onPropertyBought(playGameTask)
			.takeUntil(playGameTask.completed())
			.subscribe(function (info) {
				messages.onNext(Messages.logPropertyBought(info.player, info.property));
			});
			
		onRentPaid(playGameTask)
			.takeUntil(playGameTask.completed())
			.subscribe(function (info) {
				messages.onNext(Messages.logRentPaid(info.amount, info.fromPlayer, info.toPlayer));
			});
			
		onSalaryEarned(playGameTask)
			.takeUntil(playGameTask.completed())
			.subscribe(function (player) {
				messages.onNext(Messages.logSalaryReceived(player));
			});
			
		onTaxPaid(playGameTask)
			.takeUntil(playGameTask.completed())
			.subscribe(function (info) {
				messages.onNext(Messages.logTaxPaid(info.amount, info.player));
			});
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
			});
	}
	
	function onPropertyBought(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
			.filter(function (states) {
				return _.some(states.current.players(), function (player, index) {
					var currentProperties = player.properties();
					var previousProperties = states.previous.players()[index].properties();
					
					return currentProperties.length > previousProperties.length;
				});
			})
			.map(function (states) {
				var player = states.previous.players()[states.current.currentPlayerIndex()];
				var newProperty = findNewProperty(states);
				
				return {
					player: player,
					property: newProperty
				};
			});
	}
	
	function onRentPaid(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
			.filter(function (states) {
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
				
				return {
					fromPlayer: fromPlayer,
					toPlayer: toPlayer,
					amount: amount
				};
			});
	}
	
	function onSalaryEarned(playGameTask) {
		return combineWithPrevious(playGameTask.gameState())
		.filter(function (states) {
			var currentPlayer = states.current.players()[states.current.currentPlayerIndex()];
			var previousPlayer = states.previous.players()[states.current.currentPlayerIndex()];
			
			return currentPlayer.money() === (previousPlayer.money() + 200);
		})
		.map(function (states) {
			return states.current.players()[states.current.currentPlayerIndex()];
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
				
				return {
					player: playerWhoPaid,
					amount: amount
				};
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
},{"./contract":7,"./messages":23}],22:[function(require,module,exports){
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
			console.insert('span', '.game-log-message')
				.classed('game-log-message', true)
				.text(log.message())
				.style('opacity', 0)
				.transition().duration(600).style("opacity", 1);
		});
	};
}());
},{"./contract":7}],23:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var Player = require('./player');
	var Property = require('./property');
	
	exports.logDiceRoll = function (player, die1, die2) {
		precondition(player && Player.isPlayer(player),
			'A log about dice roll requires the name of the player who rolled the dice');
		precondition(_.isNumber(die1) && die1 >= 1 && die1 <= 6,
			'A log about dice roll requires a first die between 1 and 6');
		precondition(_.isNumber(die2) && die2 >= 1 && die2 <= 6,
			'A log about dice roll requires a first die between 1 and 6');
		
		var message = i18n.LOG_DICE_ROLL
					.replace('{player}', player.name())
					.replace('{die1}', die1)
					.replace('{die2}', die2);
						
		return new Log('dice-roll', message);
	};
	
	exports.logDoubleDiceRoll = function (player, dice) {
		precondition(player && Player.isPlayer(player),
			'A log about double dice roll requires the player who rolled the dice');
		precondition(_.isNumber(dice) && dice,
			'A log about double dice roll requires dice to be greater than 1');
		
		var message = i18n.LOG_DOUBLE_DICE_ROLL
						.replace('{player}', player.name())
						.replace('{dice}', dice);
						
		return new Log('double-dice-roll', message);
	};
	
	exports.logPropertyBought = function (player, property) {
		precondition(player && Player.isPlayer(player),
			'A log about property bought requires the player who bought');
		precondition(property && Property.isProperty(property),
			'A log about property bought requires the property that was bought');
		
		var message = i18n.LOG_PROPERTY_BOUGHT
						.replace('{player}', player.name())
						.replace('{property}', property.name());
						
		return new Log('property-bought', message);
	};
	
	exports.logRentPaid = function (amount, fromPlayer, toPlayer) {
		precondition(_.isNumber(amount) && amount > 0,
			'A log about rent paid requires an amount greater than 0');
		precondition(fromPlayer && Player.isPlayer(fromPlayer),
			'A log about rent paid requires of the player who paid');
		precondition(toPlayer && Player.isPlayer(toPlayer),
			'A log about rent paid requires of the player who received the payment');
		
		var message = i18n.LOG_RENT_PAID
						.replace('{amount}', i18n.formatPrice(amount))
						.replace('{fromPlayer}', fromPlayer.name())
						.replace('{toPlayer}', toPlayer.name());
		
		return new Log('rent-paid', message);
	};
	
	exports.logSalaryReceived = function (player) {
		precondition(player && Player.isPlayer(player),
			'A log about player salary requires the player');
			
		var message = i18n.LOG_SALARY
						.replace('{player}', player.name());
						
		return new Log('salary-earned', message);
	};
	
	exports.logTaxPaid = function (amount, player) {
		precondition(_.isNumber(amount) && amount > 0,
			'A log about tax paid requires an amount greater than 0');
		precondition(player && Player.isPlayer(player),
			'A log about tax paid requires of the player who paid');
			
		var message = i18n.LOG_TAX_PAID
						.replace('{amount}', i18n.formatPrice(amount))
						.replace('{player}', player.name());
						
		return new Log('tax-paid', message);
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
}());
},{"./contract":7,"./i18n":20,"./player":29,"./property":33}],24:[function(require,module,exports){
(function() {
	"use strict";
	
	var BoardWidget = require('./board-widget');
	var DiceWidget = require('./dice-widget');
	var GameChoicesWidget = require('./game-choices-widget');
	var PlayersWidget = require('./players-widget');
	var LogGameWidget = require('./log-game-widget');
	
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
			.text(i18n.BUTTON_NEW_GAME)
			.on('click', function() {
				playGameTask.stop();
			});
		
		GameChoicesWidget.render($(centralComponentsContainer[0]), playGameTask.handleChoicesTask());
		LogGameWidget.render($(centralComponentsContainer[0]), playGameTask.messages());
		BoardWidget.render($(panel[0]), playGameTask.gameState());
		PlayersWidget.render($(panel[0]), playGameTask.gameState());
		
		playGameTask.rollDiceTaskCreated().subscribe(function (task) {
			DiceWidget.render($(centralComponentsContainer[0]), task);
		});
	};
}());

},{"./board-widget":1,"./contract":7,"./dice-widget":8,"./game-choices-widget":11,"./i18n":20,"./log-game-widget":22,"./players-widget":30}],25:[function(require,module,exports){
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
		
		var self = this;
		return other.match({
			'pay-rent': function (rent, toPlayerId, _) {
				return self._rent === rent && self._toPlayerId === toPlayerId;
			}
		});
	};
	
	PayRentChoice.prototype.match = function (visitor) {
		return visitor[this.id](this._rent, this._toPlayerId, this._toPlayerName);
	};
	
	PayRentChoice.prototype.requiresDice = function () {
		return false;
	};
	
	PayRentChoice.prototype.computeNextState = function (state) {
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
		
		return GameState.turnEndState({
			squares: state.squares(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex()
		}, true);
	};
}());
},{"./contract":7,"./game-state":13,"./i18n":20,"./player":29}],26:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var GameState = require('./game-state');
	
	exports.newChoice = function (amount) {
		precondition(_.isNumber(amount) && amount > 0, 'A PayTaxChoice requires a tax greater than 0');
		
		return new PayTaxChoice(amount);
	};
	
	function PayTaxChoice(amount) {
		this.id = 'pay-tax';
		this.name = i18n.CHOICE_PAY_TAX.replace('{amount}', i18n.formatPrice(amount));
		this._amount = amount;
	}
	
	PayTaxChoice.prototype.equals = function (other) {
		if (!(other instanceof PayTaxChoice)) {
			return false;
		}
		
		var self = this;
		return other.match({
			'pay-tax': function (amount) {
				return self._amount === amount;
			}
		});
	};
	
	PayTaxChoice.prototype.match = function (visitor) {
		return visitor[this.id](this._amount);
	};
	
	PayTaxChoice.prototype.requiresDice = function () {
		return false;
	};
	
	PayTaxChoice.prototype.computeNextState = function (state) {
		var amount = this._amount;
		
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return player.pay(amount);
			}
			
			return player;
		});
		
		return GameState.turnEndState({
			squares: state.squares(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex()
		}, true);
	};
}());
},{"./contract":7,"./game-state":13,"./i18n":20}],27:[function(require,module,exports){
(function() {
	"use strict";
	
	var RollDiceTask = require('./roll-dice-task');
	var LogGameTask = require('./log-game-task');
	var HandleChoicesTask = require('./handle-choices-task');
	var Player = require('./player');
	var GameState = require('./game-state');
	
	var precondition = require('./contract').precondition;
	
	exports.start = function (gameConfiguration) {
		precondition(_.isArray(gameConfiguration.squares),
			'PlayGameTask requires a configuration with a list of squares');
		precondition(_.isArray(gameConfiguration.players),
			'PlayGameTask requires a configuration with a list of players');
		precondition(gameConfiguration.options,
			'PlayGameTask requires a configuration with an options object');
		
		return new PlayGameTask(gameConfiguration);
	};
	
	function PlayGameTask(gameConfiguration) {
		this._gameState = new Rx.ReplaySubject(1);
		this._options = gameConfiguration.options;
		this._completed = new Rx.AsyncSubject();
		this._rollDiceTaskCreated = new Rx.Subject();
		this._logGameTask = LogGameTask.start(this);
		
		this._handleChoicesTask = HandleChoicesTask.start(this);
		listenForChoices(this);
		
		startTurn(this, initialGameState(gameConfiguration.squares, gameConfiguration.players));
	}
	
	function listenForChoices(self) {
		self._handleChoicesTask.choiceMade()
			.takeUntil(self._completed)
			.subscribe(makeChoice(self));
	}
	
	function initialGameState(squares, players) {
		return GameState.turnStartState({
			squares: squares,
			players: Player.newPlayers(players),
			currentPlayerIndex: 0
		});
	}
	
	function startTurn(self, state) {
		self._gameState.onNext(state);
	}
	
	PlayGameTask.prototype.handleChoicesTask = function () {
		return this._handleChoicesTask;
	};
	
	PlayGameTask.prototype.messages = function () {
		return this._logGameTask.messages();
	};
	
	PlayGameTask.prototype.gameState = function () {
		return this._gameState.asObservable();
	};
	
	PlayGameTask.prototype.rollDiceTaskCreated = function () {
		return this._rollDiceTaskCreated.asObservable();
	};
	
	PlayGameTask.prototype.completed = function () {
		return this._completed.asObservable();
	};
	
	PlayGameTask.prototype.stop = function () {
		this._completed.onNext(true);
		this._completed.onCompleted();
	};
	
	function makeChoice(self) {
		return function (choice) {
			self._gameState.take(1)
				.flatMap(computeNextState(self, choice))
				.subscribe(function (state) {
					self._gameState.onNext(state);
				});			
		};
	}
	
	function computeNextState(self, choice) {
		return function (state) {
			if (choice.requiresDice()) {
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
			
			var nextState = choice.computeNextState(state);
			return Rx.Observable.return(nextState);
			
			
			/*return choice.match({
				'roll-dice': rollDice(self, state)
			});*/
		};
	}
	
	/*function rollDice(self, state) {
		return function () {
			var task = RollDiceTask.start({
				fast: self._options.fastDice,
				dieFunction: self._options.dieFunction
			});
			
			self._rollDiceTaskCreated.onNext(task);
			return task.diceRolled().last()
				.map(function (dice) {
					return movePlayer(state, dice);
				});
		};
	}
	
	function movePlayer(state, dice) {
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return player.move(dice);
			}
			
			return player;
		});
		
		return GameState.turnEndState({
			squares: state.squares(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex()
		});
	}*/
}());
},{"./contract":7,"./game-state":13,"./handle-choices-task":17,"./log-game-task":21,"./player":29,"./roll-dice-task":35}],28:[function(require,module,exports){
(function() {
	"use strict";
	
	exports.colors = function () {
		return [
			'red', 'lawngreen', 'darkblue', 'cyan', 'deepskyblue', 'darkslategrey', 'lightsalmon', 'silver'
		];
	};
}());
},{}],29:[function(require,module,exports){
(function() {
	"use strict";
	
	var PlayerColors = require('./player-colors').colors();
	var Property = require('./property');
	
	var precondition = require('./contract').precondition;
	var i18n = require('./i18n').i18n();
	
	exports.isPlayer = function (candidate) {
		return candidate instanceof Player;
	};
	
	exports.newPlayers = function (playerConfigurations) {
		precondition(_.isArray(playerConfigurations) && playerConfigurations.length >= 3,
			'Creating players require at least 3 player configurations');
		
		return _.map(playerConfigurations, function (playerConfiguration, index) {
			return newPlayer({
				id: 'player' + index,
				name: i18n.DEFAULT_PLAYER_NAME.replace('{index}', index + 1),
				money: 1500,
				position: 0,
				color: PlayerColors[index],
				type: playerConfiguration.type,
				properties: []
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
	
	Player.prototype.move = function (dice) {
		precondition(_.isArray(dice) && dice.length === 2 && _.isNumber(dice[0]) && _.isNumber(dice[1]),
			'Moving a player requires a dice with two numbers');
			
		var squareCount = 40;
		var newPosition = this.position() + dice[0] + dice[1];
		
		return newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money() + (newPosition >= squareCount ? 200 : 0),
			position: newPosition % squareCount,
			color: this.color(),
			type: this.type(),
			properties: this.properties()
		});
	};
	
	Player.prototype.buyProperty = function (property) {
		precondition(property && Property.isProperty(property), 'Player buying property requires a property');
		
		return newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money() - property.price(),
			position: this.position(),
			color: this.color(),
			type: this.type(),
			properties: insertProperty(property, this.properties())
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
	
	Player.prototype.pay = function (amount) {
		precondition(_.isNumber(amount) && amount > 0,
			'Player requires an amount to pay, that is greater than 0');
			
		precondition(this.money() > amount, 'Player does not have enough money to pay ' + amount);
		
		return playerWithAdditionalMoney(this, -amount);
	};
	
	Player.prototype.earn = function (amount) {
		precondition(_.isNumber(amount) && amount > 0,
			'Player requires an amount to earn, that is greater than 0');
		
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
			properties: player.properties()
		});
	}
}());
},{"./contract":7,"./i18n":20,"./player-colors":28,"./property":33}],30:[function(require,module,exports){
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
	}
}());
},{"./contract":7,"./i18n":20}],31:[function(require,module,exports){
(function () {
    'use strict';

    var precondition = require('./contract').precondition;

    exports.render = function (container, positioning) {
        precondition(container, "A popup require a positionned container to render into");
        // Example : top + height + left + width, OR top + bottom + left + width, and so forth
        precondition(isFullyPositioned(positioning), "The popup must be fully positioned vertically and horizontally");

        var htmlElements = renderDom(container, positioning);
        var closedSubject = bindEvents(htmlElements);

        return externalInterface(htmlElements, closedSubject);
    };

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

        var closeButton = popupElement.append('button')
            .classed('popup-close-btn', true)
            .attr('data-ui', 'popup-close');
			
		closeButton.append('span')
			.classed({
				'glyphicon': true,
				'glyphicon-remove': true
			});

        var contentContainer = popupElement.append('div')
            .classed('popup-content', true);

        return {
            popupElement: popupElement,
            closeButton: closeButton,
            contentContainer: contentContainer
        };
    }

    function bindEvents(htmlElements) {
        var closedSubject = new Rx.AsyncSubject();

        htmlElements.closeButton.on('click', function () {
            closePopup(htmlElements, closedSubject);
        });

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
                closePopup(htmlElements, closedSubject);
            }
        };
    }

    function closePopup(htmlElement, closedSubject) {
        htmlElement.popupElement.classed('.popup-closing', true);
        htmlElement.popupElement.remove();
        closedSubject.onNext(true);
        closedSubject.onCompleted();
    }
}());
},{"./contract":7}],32:[function(require,module,exports){
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
},{"./contract":7}],33:[function(require,module,exports){
(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	var PropertyGroup = require('./property-group');
	
	exports.isProperty = function (candidate) {
		return candidate instanceof Property;
	};
	
	exports.newEstate = function (id, name, group, prices) {
		precondition(_.isString(id) && id.length > 0, 'Estate requires an id');
		precondition(_.isString(name) && name.length > 0, 'Estate requires a name');
		precondition(group && PropertyGroup.isGroup(group), 'Estate requires a group');
		precondition(_.isNumber(prices.value) && prices.value > 0, 'Estate must have a price');
		precondition(_.isNumber(prices.rent) && prices.rent > 0, 'Estate must have a rent');
		
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
			return baseRent * multiplier;
		};
	}
	
	function ownsAllEstatesInGroup(group, properties) {
		var estatesInGroup = group.properties();
		return _.every(estatesInGroup, function (estate) {
			var id = estate.id();
			
			return _.contains(_.map(properties, function (property) { return property.id(); }), id);
		});
	}
	
	exports.newCompany = function (id, name, group) {
		precondition(_.isString(id) && id.length > 0, 'Company requires an id');
		precondition(_.isString(name) && name.length > 0, 'Company requires a name');
		precondition(group && PropertyGroup.isGroup(group), 'Creating a company requires a group');
		
		return new Property({
			id: id,
			name: name,
			group: group,
			type: 'company',
			price: 150,
			rent: function () { return 25; }
		});
	};
	
	exports.newRailroad = function (id, name, group) {
		precondition(_.isString(id) && id.length > 0, 'Railroad requires an id');
		precondition(_.isString(name) && name.length > 0, 'Railroad requires a name');
		precondition(group && PropertyGroup.isGroup(group), 'Railroad requires a group');
		
		return new Property({
			id: id,
			name: name,
			group: group,
			type: 'railroad',
			price: 200,
			rent: railroadRent(25, group)
		});
	};
	
	function railroadRent(baseRent, group) {
		return function (ownerProperties) {
			var count = railroadCountIn(group, ownerProperties);
			return baseRent * Math.pow(2, count - 1);
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
},{"./contract":7,"./property-group":32}],34:[function(require,module,exports){
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
	
	RollDiceChoice.prototype.match = function (visitor) {
		return visitor[this.id]();
	};
	
	RollDiceChoice.prototype.requiresDice = function () {
		return true;
	};
	
	RollDiceChoice.prototype.computeNextState = function (state, dice) {
		precondition(state, 'To compute next state, a roll-dice choice requires the actual state');
		precondition(dice, 'To compute next state, a roll-dice choice requires the result of a dice roll');
		
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return player.move(dice);
			}
			
			return player;
		});
		
		return GameState.turnEndState({
			squares: state.squares(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex()
		});
	};
}());
},{"./contract":7,"./game-state":13,"./i18n":20}],35:[function(require,module,exports){
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
			.subscribe(function () {
				diceRolled.onNext([dieFunction(), dieFunction()]);
			}, _.noop, function () {
				diceRolled.onCompleted();
			});
	}

	
	function rollDie() {
		return Math.floor((Math.random() * 6) + 1);
	}
	
	RollDiceTask.prototype.diceRolled = function () {
		return this._diceRolled.asObservable();
	};
}());
},{}],36:[function(require,module,exports){
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
}());
},{}],37:[function(require,module,exports){
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
},{"./contract":7}]},{},[3]);
