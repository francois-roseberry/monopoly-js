(function() {
	"use strict";
	
	var BoardWidget = require('./board-widget');
	
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, gameTask) {
		precondition(container, 'A Monopoly game widget requires a container to render into');
		precondition(gameTask, 'A Monopoly game widget requires a game task');
		
		var panel = d3.select(container[0])
			.append('div')
			.classed('monopoly-game', true);
			
		panel.append('div')
			.append('button')
			.text('New game')
			.on('click', function () {
				gameTask.newGame();
			});
		
		gameTask.statusChanged().take(1).subscribe(function (status) {
			status.match({
				'playing': function (square) {
					BoardWidget.render($(panel[0]), square);
				}
			});
		});
	};
}());