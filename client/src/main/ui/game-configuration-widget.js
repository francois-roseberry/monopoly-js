(function() {
	"use strict";
	
	exports.render = function (container) {
		var panel = d3.select(container[0])
			.append('div')
			.classed('monopoly-game-configuration', true);
			
		panel.append('h1').text('Monopoly game configuration');
		
		var computerPlayersBox = panel.append('div');
		computerPlayersBox.append('span').text('Computer players : ');
		computerPlayersBox.append('input').classed('computer-players', true);
		var spinner = $('.computer-players');
		spinner.spinner({ min: 1, max: 7 });
		spinner.spinner('value', 1);
		
		panel.append('button').text('Start game');
	};
}());