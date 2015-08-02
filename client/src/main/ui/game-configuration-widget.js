(function() {
	"use strict";
	
	exports.render = function (container) {
		var panel = d3.select(container[0])
			.append('div')
			.classed('monopoly-game-configuration', true);
			
		panel.append('h1').text('Monopoly game configuration');
		
		panel.append('button').text('Start game');
	};
}());