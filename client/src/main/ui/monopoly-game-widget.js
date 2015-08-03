(function() {
	"use strict";
	
	var GameConfigurationWidget = require('./game-configuration-widget');
	
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, gameTask) {
		precondition(container, 'A Monopoly game widget requires a container to render into');
		precondition(gameTask, 'A Monopoly game widget requires a game task');
		
		gameTask.statusChanged().subscribe(function (status) {
			status.match({
				'configuring': renderGameConfiguration(container),
				'playing' : renderGame(container)
			});
		});
	};
	
	function renderGameConfiguration(container) {
		return function () {
			GameConfigurationWidget.render(container);
		};
	}
	
	function renderGame(container) {
		return function () {
			d3.select(container[0]).append('div').classed('monopoly-game', true);
		};
	}
}());