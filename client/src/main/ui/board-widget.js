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