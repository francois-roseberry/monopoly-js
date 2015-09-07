(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	var i18n = require('./i18n');
	var groupColors = require('./group-colors').color;
	
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
					renderPlayerTokens(d3.select(this), index, state.players());
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
					fill: groupColors(group),
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
	
	function writeText(container, text, y) {
		TextWrapper.wrap(container, text.toUpperCase(), y, SQUARE_WIDTH);
	}
	
	function writePrice(container, price) {
		var priceString = i18n.PRICE_STRING
			.replace('{price}', i18n.formatPrice(price));
		writeTextLine(container, priceString, SQUARE_HEIGHT - 8);
	}
	
	function writeTextLine(container, text, y) {
		var textElement = container.append('text')
			.text(text)
			.attr({
				y: y,
				'font-size': 10
			});
		var textWidth = textElement.node().getComputedTextLength();
		textElement.attr('x', (SQUARE_WIDTH - textWidth) / 2);
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
},{"./contract":6,"./group-colors":14,"./i18n":16,"./symbols":26,"./text-wrapper":27}],2:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n');
	var precondition = require('./contract').precondition;
	
	exports.squares = function () {
		return [
			go(),
			estate('med', i18n.PROPERTY_MED, 0, 60),
			communityChest(),
			estate('baltic', i18n.PROPERTY_BALTIC, 0, 60),
			incomeTax(),
			railroad('rr-reading', i18n.RAILROAD_READING),
			estate('east', i18n.PROPERTY_EAST, 1, 100),
			chance(),
			estate('vt', i18n.PROPERTY_VT, 1, 100),
			estate('conn', i18n.PROPERTY_CONN, 1, 120),
			
			jail(),
			estate('charles', i18n.PROPERTY_CHARLES, 2, 140),
			company('electric', i18n.COMPANY_ELECTRIC),
			estate('us', i18n.PROPERTY_US, 2, 140),
			estate('vn', i18n.PROPERTY_VN, 2, 160),
			railroad('rr-penn', i18n.RAILROAD_PENN),
			estate('jack', i18n.PROPERTY_JACK, 3, 180),
			communityChest(),
			estate('tn', i18n.PROPERTY_TN, 3, 180),
			estate('ny', i18n.PROPERTY_NY, 3, 200),
			
			parking(),
			estate('kt', i18n.PROPERTY_KT, 4, 220),
			chance(),
			estate('in', i18n.PROPERTY_IN, 4, 220),
			estate('il', i18n.PROPERTY_IL, 4, 240),
			railroad('rr-bo', i18n.RAILROAD_B_O),
			estate('at', i18n.PROPERTY_AT, 5, 260),
			estate('vr', i18n.PROPERTY_VR, 5, 260),
			company('water', i18n.COMPANY_WATER),
			estate('marvin', i18n.PROPERTY_MARVIN, 5, 280),
			
			goToJail(),
			estate('pa', i18n.PROPERTY_PA, 6, 300),
			estate('nc', i18n.PROPERTY_NC, 6, 300),
			communityChest(),
			estate('penn', i18n.PROPERTY_PENN, 6, 320),
			railroad('rr-short', i18n.RAILROAD_SHORT),
			chance(),
			estate('pk', i18n.PROPERTY_PK, 7, 350),
			luxuryTax(),
			estate('bw', i18n.PROPERTY_BW, 7, 400)
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
	
	function company(id, name) {
		precondition(_.isString(id), 'Company must have an id');
		precondition(_.isString(name), 'Company must have a name');
		
		return {
			match: match('company', [id, name, 150])
		};
	}
	
	function railroad(id, name) {
		precondition(_.isString(id), 'Railroad must have an id');
		precondition(_.isString(name), 'Railroad must have a name');
		
		return {
			match: match('railroad', [id, name, 200])
		};
	}
	
	function estate(id, name, group, price) {
		precondition(_.isString(id), 'Property must have an id');
		precondition(_.isString(name), 'Property must have a name');
		precondition(_.isNumber(group), 'Property must have a group');
		precondition(_.isNumber(price), 'Property must have a price');
		
		return {
			match: match('estate', [id, name, price, group])
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
},{"./contract":6,"./i18n":16}],3:[function(require,module,exports){
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


},{"./fail-fast":8,"./game-task":12,"./game-widget":13}],4:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n');
	
	exports.rollDice = function () {
		return {
			id: 'roll-dice',
			name: i18n.CHOICE_ROLL_DICE,
			match: function (visitor) {
				return visitor['roll-dice']();
			}
		};
	};
	
	exports.finishTurn = function () {
		return {
			id: 'finish-turn',
			name: i18n.CHOICE_FINISH_TURN,
			match: function (visitor) {
				return visitor['finish-turn']();
			}
		};
	};
	
	exports.buyProperty = function (id, name, price) {
		return {
			id: 'buy-property',
			name: i18n.CHOICE_BUY_PROPERTY.replace('{property}', name).replace('{price}', i18n.formatPrice(price)),
			match: function (visitor) {
				return visitor['buy-property'](id, price);
			}
		};
	};
}());
},{"./i18n":16}],5:[function(require,module,exports){
(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.start = function () {
		return new ConfigureGameTask();
	};
	
	function ConfigureGameTask() {
		this._completed = new Rx.AsyncSubject();
		this._players = new Rx.BehaviorSubject(players(1));
	}
	
	ConfigureGameTask.prototype.players = function () {
		return this._players.asObservable();
	};
	
	ConfigureGameTask.prototype.setComputers = function (count) {
		precondition(_.isNumber(count) && count > 0 && count < 8,
			'The number of computer players must be between 1 and 7');
			
		this._players.onNext(players(count));
	};
	
	ConfigureGameTask.prototype.startGame = function () {
		this._completed.onNext(true);
		this._completed.onCompleted();
	};
	
	ConfigureGameTask.prototype.completed = function () {
		return this._completed.asObservable();
	};
	
	function players(computers) {
		var allPlayers = [{ type: 'human' }];
		for (var i = 0; i < computers; i++) {
			allPlayers.push({ type: 'computer' });
		}
		return allPlayers;
	}
}());
},{"./contract":6}],6:[function(require,module,exports){
(function() {
	"use strict";
	
	exports.precondition = function (check, message) {
        if (check) {
            return;
        }
        throw new Error("Precondition: " + message);
    };
}());
},{}],7:[function(require,module,exports){
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
},{"./contract":6}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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
},{"./contract":6}],10:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n');
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, configureGameTask) {
		precondition(container, 'Game configuration widget requires container to render into');
		precondition(configureGameTask, 'Game configuration widget requires a ConfigureGameTask');
		
		var panel = d3.select(container[0])
			.append('div')
			.classed('monopoly-game-configuration', true);
			
		panel.append('h1').text(i18n.CONFIGURE_GAME_TITLE);
		
		var computerPlayersBox = panel.append('div');
		computerPlayersBox.append('span').text(i18n.COMPUTER_PLAYERS_LABEL + ' : ');
		computerPlayersBox.append('input').classed('computer-players', true);
		var spinner = $('.computer-players');
		spinner.spinner({ min: 1, max: 7 });
		configureGameTask.players().take(1).subscribe(function (players) {
			spinner.spinner('value', players.length - 1);
			spinner.on('spinchange', function (event) {
				configureGameTask.setComputers(spinner.spinner('value'));
			});
		});
		
		panel.append('button')
			.classed('btn-start-game', true)
			.text(i18n.BUTTON_START_GAME)
			.on('click', function () {
				configureGameTask.startGame();
			});
	};
}());
},{"./contract":6,"./i18n":16}],11:[function(require,module,exports){
(function() {
	"use strict";
	
	var Choices = require('./choices');
	
	var precondition = require('./contract').precondition;
	
	exports.turnStartState = function (info) {
		validateInfo(info);
			
		var choices = newTurnChoices();
		
		return new GameState(info, choices);
	};
	
	function newTurnChoices() {
		return [Choices.rollDice()];
	}
	
	exports.turnEndState = function (info) {
		validateInfo(info);
			
		var choices = turnEndChoices(info);
		
		return new GameState(info, choices);
	};
	
	function turnEndChoices(info) {
		var currentPlayer = info.players[info.currentPlayerIndex];
		var currentSquare = info.squares[currentPlayer.position()];
		var choices = choicesForSquare(currentSquare, info.players, currentPlayer);
		
		choices.push(Choices.finishTurn());
			
		return choices;
	}
	
	function choicesForSquare(square, players, currentPlayer) {
		return square.match({
			'estate': choicesForProperty(players, currentPlayer),
			'railroad': choicesForProperty(players, currentPlayer),
			'company': choicesForProperty(players, currentPlayer),
			_: noChoices
		});
	}
	
	function noChoices() {
		return [];
	}
	
	function choicesForProperty(players, currentPlayer) {
		return function (id, name, price) {
			if (!isOwned(players, id) && currentPlayer.money() > price) {
				return [Choices.buyProperty(id, name, price)];
			}
			
			return [];
		};
	}
	
	function isOwned(players, propertyId) {
		return _.some(players, function (player) {
			return _.some(player.properties(), function (property) {
				return property === propertyId;
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
	
	GameState.prototype.propertyById = function (propertyId) {
		var match = _.find(this._squares, function (square) {
			return square.match({
				'estate': function (id) { return id === propertyId; },
				'railroad': function (id) { return id === propertyId; },
				'company': function (id) { return id === propertyId; },
				_: function () { return false; }
			});
		});
		
		if (match === null) {
			throw new Error('Could not find property with id : ' + propertyId);
		}
		
		return match;
	};
}());
},{"./choices":4,"./contract":6}],12:[function(require,module,exports){
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
		task.completed()
			.withLatestFrom(task.players(), function (_, players) {
				return players;
			})
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
},{"./board":2,"./configure-game-task":5,"./play-game-task":21}],13:[function(require,module,exports){
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
},{"./contract":6,"./game-configuration-widget":10,"./monopoly-game-widget":20}],14:[function(require,module,exports){
(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.color = function (groupIndex) {
		var colors = ['midnightblue', 'lightskyblue', 'mediumvioletred', 'orange', 'red', 'yellow', 'green', 'blue'];
		
		precondition(colors[groupIndex], 'No color has been defined for group ' + groupIndex);
		
		return colors[groupIndex];
	};
}());
},{"./contract":6}],15:[function(require,module,exports){
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
},{"./contract":6}],16:[function(require,module,exports){
(function() {
	"use strict";
	
	exports.CONFIGURE_GAME_TITLE = 'Monopoly - configuration de partie';
	exports.COMPUTER_PLAYERS_LABEL = 'Joueurs IA';
	
	// Buttons
	exports.BUTTON_NEW_GAME = 'Nouvelle partie';
	exports.BUTTON_START_GAME = 'Commencer la partie';
	
	// Choices
	exports.CHOICE_ROLL_DICE = 'Lancer les dés';
	exports.CHOICE_FINISH_TURN = 'Terminer le tour';
	exports.CHOICE_BUY_PROPERTY = 'Acheter {property} pour {price}';
	
	// Log messages
	exports.LOG_DICE_ROLL = '{player} a obtenu un {die1} et un {die2}';
	exports.LOG_DOUBLE_DICE_ROLL = '{player} a obtenu un doublé de {dice}';
	
	// Squares
	exports.CHANCE = 'Chance';
	exports.COMMUNITY_CHEST = 'Caisse commune';
	exports.INCOME_TAX = 'Impôt sur le revenu';
	exports.LUXURY_TAX = 'Taxe de luxe';
	
	exports.COMPANY_WATER = 'Aqueduc';
	exports.COMPANY_ELECTRIC = "Compagnie d'électricité";
	
	exports.RAILROAD_READING = 'Chemin de fer Reading';
	exports.RAILROAD_PENN = 'Chemin de fer Pennsylvanie';
	exports.RAILROAD_B_O = 'Chemin de fer B.& O.';
	exports.RAILROAD_SHORT = 'Chemin de fer Petit Réseau';
	
	exports.PROPERTY_MED = 'Avenue de la Méditerrannée';
	exports.PROPERTY_BALTIC = 'Avenue de la Baltique';
	exports.PROPERTY_EAST = "Avenue de l'Orient";
	exports.PROPERTY_VT = 'Avenue Vermont';
	exports.PROPERTY_CONN = 'Avenue Connecticut';
	exports.PROPERTY_CHARLES = 'Place St-Charles';
	exports.PROPERTY_US = 'Avenue des États-Unis';
	exports.PROPERTY_VN = 'Avenue Virginie';
	exports.PROPERTY_JACK = 'Place St-Jacques';
	exports.PROPERTY_TN = 'Avenue Tennessee';
	exports.PROPERTY_NY = 'Avenue New York';
	exports.PROPERTY_KT = 'Avenue Kentucky';
	exports.PROPERTY_IN = 'Avenue Indiana';
	exports.PROPERTY_IL = 'Avenue Illinois';
	exports.PROPERTY_AT = 'Avenue Atlantique';
	exports.PROPERTY_VR = 'Avenue Ventnor';
	exports.PROPERTY_MARVIN = 'Jardins Marvin';
	exports.PROPERTY_PA = 'Avenue Pacifique';
	exports.PROPERTY_NC = 'Avenue Caroline du Nord';
	exports.PROPERTY_PENN = 'Avenue Pennsylvanie';
	exports.PROPERTY_PK = 'Place du parc';
	exports.PROPERTY_BW = 'Promenade';
	
	// Price formatting
	exports.PRICE_STRING = 'PRIX {price}';
	exports.formatPrice = function (price) {
		return price + ' $';
	};
}());
},{}],17:[function(require,module,exports){
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
	
	function combineDiceAndState(dice, state) {
		return {
			firstDie : dice[0],
			secondDie: dice[1],
			player: state.players()[state.currentPlayerIndex()].name()
		};
	}
	
	LogGameTask.prototype.messages = function () {
		return this._messages.asObservable();
	};
}());
},{"./contract":6,"./messages":19}],18:[function(require,module,exports){
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
			console.append('span')
				.classed('game-log-message', true)
				.text(log.message());
		});
	};
}());
},{"./contract":6}],19:[function(require,module,exports){
(function() {
	"use strict";
	
	var i18n = require('./i18n');
	
	exports.logDiceRoll = function (player, die1, die2) {
		var message = i18n.LOG_DICE_ROLL
					.replace('{player}', player)
					.replace('{die1}', die1)
					.replace('{die2}', die2);
						
		return new Log('dice-roll', message);
	};
	
	exports.logDoubleDiceRoll = function (player, dice) {
		var message = i18n.LOG_DOUBLE_DICE_ROLL
						.replace('{player}', player)
						.replace('{dice}', dice);
						
		return new Log('double-dice-roll', message);
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
}());
},{"./i18n":16}],20:[function(require,module,exports){
(function() {
	"use strict";
	
	var BoardWidget = require('./board-widget');
	var DiceWidget = require('./dice-widget');
	var GameChoicesWidget = require('./game-choices-widget');
	var PlayersWidget = require('./players-widget');
	var LogGameWidget = require('./log-game-widget');
	
	var i18n = require('./i18n');
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

},{"./board-widget":1,"./contract":6,"./dice-widget":7,"./game-choices-widget":9,"./i18n":16,"./log-game-widget":18,"./players-widget":24}],21:[function(require,module,exports){
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
			return choice.match({
				'roll-dice': rollDice(self, state),
				'finish-turn': finishTurn(state),
				'buy-property': buyProperty(state)
			});
		};
	}
	
	function rollDice(self, state) {
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
	
	function finishTurn(state) {
		return function () {
			return Rx.Observable.return(nextPlayer(state));
		};
	}
	
	function buyProperty(state) {
		return function (id, price) {
			return Rx.Observable.return(transferOwnership(state, id, price));
		};
	}
	
	function transferOwnership(state, id, price) {
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return player.buyProperty(id, price);
			}
			
			return player;
		});
		
		return GameState.turnEndState({
			squares: state.squares(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex()
		});
	}
	
	function movePlayer(state, dice) {
		var newPlayers = _.map(state.players(), function (player, index) {
			if (index === state.currentPlayerIndex()) {
				return player.move(dice, state.squares().length);
			}
			
			return player;
		});
		
		return GameState.turnEndState({
			squares: state.squares(),
			players: newPlayers,
			currentPlayerIndex: state.currentPlayerIndex()
		});
	}
	
	function nextPlayer(state) {
		return GameState.turnStartState({
			squares: state.squares(),
			players: state.players(),
			currentPlayerIndex: (state.currentPlayerIndex() + 1) % state.players().length
		});
	}
}());
},{"./contract":6,"./game-state":11,"./handle-choices-task":15,"./log-game-task":17,"./player":23,"./roll-dice-task":25}],22:[function(require,module,exports){
(function() {
	"use strict";
	
	exports.colors = function () {
		return [
			'red', 'lawngreen', 'darkblue', 'cyan', 'deepskyblue', 'darkslategrey', 'lightsalmon', 'silver'
		];
	};
}());
},{}],23:[function(require,module,exports){
(function() {
	"use strict";
	
	var PlayerColors = require('./player-colors').colors();
	
	var precondition = require('./contract').precondition;
	
	exports.newPlayers = function (playerConfigurations) {
		return _.map(playerConfigurations, function (playerConfiguration, index) {
			return newPlayer({
				id: 'player' + index,
				name: 'Joueur ' + (index + 1),
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
	
	Player.prototype.move = function (dice, squareCount) {
		precondition(_.isArray(dice) && dice.length === 2 && _.isNumber(dice[0]) && _.isNumber(dice[1]),
			'Moving a player requires a dice with two numbers');
		
		return newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money(),
			position: (this.position() + dice[0] + dice[1]) % squareCount,
			color: this.color(),
			type: this.type(),
			properties: this.properties()
		});
	};
	
	Player.prototype.buyProperty = function (id, price) {
		precondition(_.isNumber(price) && this.money() > price,
			'Buying a property requires the player to have enough money');
		
		return newPlayer({
			id: this.id(),
			name: this.name(),
			money: this.money() - price,
			position: this.position(),
			color: this.color(),
			type: this.type(),
			properties: this.properties().concat([id])
		});
	};
}());
},{"./contract":6,"./player-colors":22}],24:[function(require,module,exports){
(function() {
	"use strict";
	
	var precondition =  require('./contract').precondition;
	var i18n = require('./i18n');
	
	var groupColors = require('./group-colors').color;
	
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
				.data(state.players());
				
			createPlayerPanels(panelSelection);
			updatePlayerPanels(panelSelection, state);
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
			.classed('player-money', true);
			
		panels.append('div')
			.classed('player-properties', true);
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
			.text(function (player) {
				return i18n.formatPrice(player.money());
			});
			
		var playerPropertiesSelection = selection
			.select('.player-properties')
			.selectAll('.player-property')
			.data(function (player) {
				return player.properties();
			});
			
		createPlayerProperties(playerPropertiesSelection, state);
	}
	
	function createPlayerProperties(selection, state) {
		selection.enter()
			.append('div')
			.classed('player-property', true)
			.attr('data-ui', function (propertyId) {
				return propertyId; 
			})
			.text(function (propertyId) {
				return nameOfProperty(state, propertyId);
			})
			.style('background-color', function (propertyId) {
				return colorOfProperty(state, propertyId);
			});
	}
	
	function nameOfProperty(state, propertyId) {
		var property = state.propertyById(propertyId);
		return property.match({
			'estate': function (id, name, price, group) {
				return name;
			},
			'railroad': function (id, name, price) {
				return name;
			},
			'company': function (id, name, price) {
				return name;
			},
			_: _.noop
		});
	}
	
	function colorOfProperty(state, propertyId) {
		var property = state.propertyById(propertyId);
		return property.match({
			'estate': function (id, name, price, group) {
				return groupColors(group);
			},
			'railroad': function (id, name, price) {
				return 'black';
			},
			'company': function (id, name, price) {
				return 'lightgreen';
			},
			_: _.noop
		});
	}
}());
},{"./contract":6,"./group-colors":14,"./i18n":16}],25:[function(require,module,exports){
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
},{}],26:[function(require,module,exports){
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
},{}],27:[function(require,module,exports){
(function () {
    'use strict';

    exports.wrap = function (container, text, y, width) {
		var textElement = container.append('text')
			.attr({
				x: 0,
				y: y,
				'font-size': 8
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
},{}]},{},[3]);
