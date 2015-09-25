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