(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, square) {
		precondition(container, 'A Board Widget requires a container to render into');
		precondition(square, 'A Board Widget requires a square');
		
		d3.select(container[0]).append('svg')
			.classed('monopoly-board', true)
			.selectAll('.monopoly-square')
			.data([square])
			.enter()
			.append('rect')
			.classed('monopoly-square', true)
			.attr({
				width: '120',
				height: '120'
			});
	};
}());