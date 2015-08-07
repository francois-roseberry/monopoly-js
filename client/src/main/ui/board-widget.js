(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	var SQUARE_WIDTH = 100;
	var SQUARE_HEIGHT = 160;
	
	exports.render = function (container, squares) {
		precondition(container, 'A Board Widget requires a container to render into');
		precondition(_.isArray(squares), 'A Board Widget requires a list of squares');
		
		var rows = [squares.slice(0, 10), squares.slice(10, 20), squares.slice(20, 30), squares.slice(30, 40)];
		var graphicalSquares = d3.select(container[0]).append('svg')
			.classed('monopoly-board', true)
			.attr({
				width: 9 * SQUARE_WIDTH + 2 * SQUARE_HEIGHT,
				height: 9 * SQUARE_WIDTH + 2 * SQUARE_HEIGHT
			})
			.selectAll('.monopoly-row')
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
			
		graphicalSquares
			.append('rect')
			.attr({
				fill: 'white',
				stroke: 'black',
				width: function (square, index) {
					return index === 0 ? SQUARE_HEIGHT : SQUARE_WIDTH;
				},
				height: SQUARE_HEIGHT
			});
			
		graphicalSquares
			.each(function (square) {
				renderSquare(d3.select(this), square);
			});
	};
	
	function renderSquare(container, square) {
		square.match({
			'estate': function (group) {
				container.append('rect')
					.attr({
						width: SQUARE_WIDTH,
						height: SQUARE_HEIGHT / 5,
						fill: groupColor(group),
						stroke: 'black'
					});
			},
			'railroad': function() { writeCenteredText(container, 'CHEMIN DE FER'); },
			'community-chest': function () { writeCenteredText(container, 'CAISSE'); },
			'chance': function () { writeCenteredText(container, 'CHANCE'); },
			'income-tax': function () { writeCenteredText(container, 'IMPÔT SUR'); },
			'luxury-tax': function () { writeCenteredText(container, 'TAXE'); },
			'company': _.noop,
			'go': _.noop,
			'jail': _.noop,
			'go-to-jail': _.noop,
			'parking': _.noop
		});
	}
	
	function writeCenteredText(container, text) {
		var textElement = container.append('text')
			.text(text)
			.attr({
				y: 20,
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
	
	function groupColor(group) {
		var colors = ['midnightblue', 'lightskyblue', 'mediumvioletred', 'orange', 'red', 'yellow', 'green', 'blue'];
		
		precondition(colors[group], 'No color has been defined for group ' + group);
		
		return colors[group];
	}
}());