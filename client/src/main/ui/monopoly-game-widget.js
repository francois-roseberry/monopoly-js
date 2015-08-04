(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, gameTask) {
		precondition(container, 'A Monopoly game widget requires a container to render into');
		precondition(gameTask, 'A Monopoly game widget requires a game task');
		
		var panel = d3.select(container[0])
			.append('div')
			.classed('monopoly-game', true);
			
		panel.append('button')
			.text('New game')
			.on('click', function () {
				gameTask.newGame();
			});
	};
}());