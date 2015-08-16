(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	var Symbols = require('./symbols');
	
	var SQUARE_WIDTH = 100;
	var SQUARE_HEIGHT = 160;
	var SQUARES_PER_ROW = 10;
	
	exports.render = function (container, gameState) {
		precondition(container, 'A Board Widget requires a container to render into');
		precondition(gameState, 'A Board Widget requires an observable of the gameState');
		
		var board = d3.select(container[0]).append('svg')
			.classed('monopoly-board', true)
			.attr({
				width: 9 * SQUARE_WIDTH + 2 * SQUARE_HEIGHT,
				height: 9 * SQUARE_WIDTH + 2 * SQUARE_HEIGHT
			});
		
		gameState.subscribe(renderSquares(board));
	};
	
	function renderSquares(container) {
		return function (state) {
			var rows = [
				state.squares.slice(0, SQUARES_PER_ROW),
				state.squares.slice(SQUARES_PER_ROW, SQUARES_PER_ROW * 2),
				state.squares.slice(SQUARES_PER_ROW * 2, SQUARES_PER_ROW * 3),
				state.squares.slice(SQUARES_PER_ROW * 3, SQUARES_PER_ROW * 4)
			];
			
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
					renderSquare(d3.select(this), square, state.players);
				});
				
			container.selectAll('.monopoly-square')
				.data(state.squares)
				.each(function (square, index) {
					renderPlayerTokens(d3.select(this), index, state.players);
				});
			};
	}
	
	function renderSquare(container, square, players) {
		square.match({
			'estate': renderEstate(container),
			'railroad': renderRailroad(container),
			'community-chest': function () { writeText(container, ['CAISSE', 'COMMUNE']); },
			'chance': function () { writeText(container, ['CHANCE']); },
			'income-tax': function () { writeText(container, ['IMPÔT SUR', 'LE REVENU']); },
			'luxury-tax': function () { writeText(container, ['TAXE', 'DE LUXE']); },
			'company': renderCompany(container),
			'go': renderStart(container),
			'jail': renderJail(container),
			'go-to-jail': _.noop,
			'parking': _.noop
		});
	}
	
	function renderPlayerTokens(container, squareIndex, players) {
		var playersOnSquare = _.filter(players, function (player) {
			return player.position === squareIndex;
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
				return player.color;
			}
		);
			
		tokens.exit().remove();
	}
	
	function renderEstate(container) {
		return function (id, group, price) {
			container.append('rect')
				.attr({
					width: SQUARE_WIDTH,
					height: SQUARE_HEIGHT / 5,
					fill: groupColor(group),
					stroke: 'black'
				});
			writeText(container, estateName(id), SQUARE_HEIGHT / 5);
			writePrice(container, price);
		};
	}
	
	function renderRailroad(container) {
		return function (id, price) {
			container.append('g')
				.attr('transform', 'scale(0.25) translate(50, 150)')
				.html(Symbols.train());
				
			writeText(container, ['CHEMIN DE FER', railroadName(id)]);
			writePrice(container, price);
		};
	}
	
	function renderStart(container) {
		return function () {
			container.append('g')
				.attr('transform', 'translate(6, 130)')
				.html(Symbols.arrow());
		};
	}
	
	function renderCompany(container) {
		return function (id, price) {
			writeText(container, companyName(id));
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
	
	function estateName(id) {
		var names = {
			'med': ['AVENUE', 'DE LA', 'MEDITERRANÉE'],
			'baltic': ['AVENUE DE', 'LA BALTIQUE'],
			'east': ['AVENUE', "DE L'ORIENT"],
			'vt': ['AVENUE', 'VERMONT'],
			'conn': ['AVENUE', 'CONNECTICUT'],
			'charles': ['PLACE', 'ST-CHARLES'],
			'us': ['AVENUE DES', 'ÉTATS-UNIS'],
			'vn': ['AVENUE', 'VIRGINIE'],
			'jack': ['PLACE', 'ST-JACQUES'],
			'tn': ['AVENUE', 'TENNESSEE'],
			'ny': ['AVENUE', 'NEW YORK'],
			'kt': ['AVENUE', 'KENTUCKY'],
			'in': ['AVENUE', 'INDIANA'],
			'il': ['AVENUE', 'ILLINOIS'],
			'at': ['AVENUE', 'ATLANTIQUE'],
			'vr': ['AVENUE', 'VENTNOR'],
			'marvin': ['JARDINS', 'MARVIN'],
			'pa': ['AVENUE', 'PACIFIQUE'],
			'nc': ['AVENUE', 'CAROLINE', 'DU NORD'],
			'penn': ['AVENUE', 'PENNSYLVANIE'],
			'pk': ['PLACE', 'DU PARC'],
			'bw': ['PROMENADE']
		};
		
		precondition(names[id], 'No name has been defined for estate : ' + id);
		
		return names[id];
	}
	
	function companyName(id) {
		var names = {
			'water': ['AQUEDUC'],
			'electric': ['COMPAGNIE', "D'ÉLECTRICITÉ"]
		};
		
		precondition(names[id], 'No name has been defined for company : ' + id);
		
		return names[id];
	}
	
	function railroadName(id) {
		var names = {
			'reading': 'READING',
			'penn': 'PENNSYLVANIE',
			'b-o': 'B. & O.',
			'short': 'PETIT RÉSEAU'
		};
		
		precondition(names[id], 'No name has been defined for railroad : ' + id);
		
		return names[id];
	}
	
	function writeText(container, lines, baseY) {
		_.each(lines, function (line, index) {
			var y = (baseY || 0) + 20 + index * 16;
			writeTextLine(container, line, y);
		});
	}
	
	function writePrice(container, price) {
		writeTextLine(container, 'PRIX ' + price + '$', SQUARE_HEIGHT - 20);
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
	
	function groupColor(groupIndex) {
		var colors = ['midnightblue', 'lightskyblue', 'mediumvioletred', 'orange', 'red', 'yellow', 'green', 'blue'];
		
		precondition(colors[groupIndex], 'No color has been defined for group ' + groupIndex);
		
		return colors[groupIndex];
	}
}());