(function() {
	"use strict";
	
	var BoardWidget = require('./board-widget');
	var GameChoicesWidget = require('./game-choices-widget');
	var PlayersWidget = require('./players-widget');
	
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, playGameTask) {
		precondition(container, 'A Monopoly game widget requires a container to render into');
		precondition(playGameTask, 'A Monopoly game widget requires a game task');
		
		var panel = d3.select(container[0])
			.append('div')
			.classed('monopoly-game', true);
			
		panel.append('div')
			.classed('monopoly-header', true)
			.append('button')
			.attr('id', 'new-game-button')
			.text('New game')
			.on('click', function () {
				playGameTask.stop();
			});
		
		GameChoicesWidget.render($(panel[0]), playGameTask);
		BoardWidget.render($(panel[0]), playGameTask.gameState());
		PlayersWidget.render($(panel[0]), playGameTask.gameState());
	};
}());
