(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.render = function (container) {
		precondition(container, 'A Board Widget requires a container to render into');
		
		d3.select(container[0]).append('svg')
			.classed('monopoly-board', true);
	};
}());