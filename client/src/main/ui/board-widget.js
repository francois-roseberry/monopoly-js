(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, squares) {
		precondition(container, 'A Board Widget requires a container to render into');
		precondition(_.isArray(squares), 'A Board Widget requires a list of squares');
		
		var graphicalSquares = d3.select(container[0]).append('svg')
			.classed('monopoly-board', true)
			.attr({
				width: 13 * 60,
				height: 13 * 60
			})
			.selectAll('.monopoly-square')
			.data(squares)
			.enter()
			.append('g')
			.classed('monopoly-square', true)
			.attr('transform', function (square, index) {
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
	
	function groupColor(group) {
		var colors = ['purple', 'blue'];
		
		precondition(colors[group], 'No color has been defined for group ' + group);
		
		return colors[group];
	}
}());