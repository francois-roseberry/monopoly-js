(function() {
	"use strict";
	
	var GameConfigurationWidget = require('./game-configuration-widget');
	
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, gameTask) {
		precondition(container, 'A Monopoly game widget requires a container to render into');
		precondition(gameTask, 'A Monopoly game widget requires a game task');
		
		gameTask.statusChanged().subscribe(function (status) {
			d3.select(container[0]).selectAll('*').remove();
			status.match({
				'configuring': renderGameConfiguration(container, gameTask),
				'playing' : renderGame(container)
			});
		});
	};
	
	function renderGameConfiguration(container, gameTask) {
		return function () {
			GameConfigurationWidget.render(container, gameTask);
		};
	}
	
	function renderGame(container) {
		return function () {
			d3.select(container[0]).append('div').classed('monopoly-game', true);
		};
	}
}());