(function() {
	"use strict";
	
	var GameConfigurationWidget = require('./game-configuration-widget');
	var MonopolyGameWidget = require('./monopoly-game-widget');
	
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, gameTask) {
		precondition(container, 'A Game widget requires a container to render into');
		precondition(gameTask, 'A Game widget requires a game task');
		
		gameTask.status().subscribe(function (status) {
			d3.select(container[0]).selectAll('*').remove();
			status.match({
				'configuring': renderGameConfiguration(container),
				'playing' : renderGame(container)
			});
		});
	};
	
	function renderGameConfiguration(container) {
		return function (configureGameTask) {
			GameConfigurationWidget.render(container, configureGameTask);
		};
	}
	
	function renderGame(container) {
		return function (playGameTask) {
			MonopolyGameWidget.render(container, playGameTask);
		};
	}
}());