(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, squares) {
		precondition(container, 'A Board Widget requires a container to render into');
		precondition(_.isArray(squares), 'A Board Widget requires a list of squares');
		
		var rows = [squares.slice(0, 10), squares.slice(10, 20), squares.slice(20, 30), squares.slice(30, 40)];
		var graphicalSquares = d3.select(container[0]).append('svg')
			.classed('monopoly-board', true)
			.attr({
				width: 13 * 60,
				height: 13 * 60
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
				return 'translate(' + (11 * 60 - 60 * index) + ')';
			});
			
		graphicalSquares
			.append('rect')
			.attr({
				fill: 'white',
				stroke: 'black',
				width: function (square, index) {
					return 60 * (index === 0 ? 2 : 1);
				},
				height: 120
			});
			
		graphicalSquares
			.each(function (square) {
				if (square.property && _.isNumber(square.property.group)) {
					d3.select(this).append('rect')
						.attr({
							width: 60,
							height: 30,
							fill: groupColor(square.property.group),
							stroke: 'black'
						});
				}
			});
	};
	
	function transformForRow(rowIndex) {
		var transforms = [
			'translate(0, ' + (11 * 60) + ')',
			'translate(' + (2 * 60) + ') rotate(90)',
			'translate(' + (13 * 60) + ', ' + (2 * 60) + ') rotate(180)',
			'translate(' + (11 * 60) + ', ' + (13 * 60)  + ') rotate(270)'
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