(function() {
	"use strict";
	
	var GameConfigurationWidget = require('./game-configuration-widget');
	var MonopolyGameWidget = require('./monopoly-game-widget');
	
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, gameTask) {
		precondition(container, 'A Monopoly game widget requires a container to render into');
		precondition(gameTask, 'A Monopoly game widget requires a game task');
		
		gameTask.statusChanged().subscribe(function (status) {
			d3.select(container[0]).selectAll('*').remove();
			status.match({
				'configuring': renderGameConfiguration(container, gameTask),
				'playing' : renderGame(container, gameTask)
			});
		});
	};
	
	function renderGameConfiguration(container, gameTask) {
		return function () {
			GameConfigurationWidget.render(container, gameTask);
		};
	}
	
	function renderGame(container, gameTask) {
		return function () {
			MonopolyGameWidget.render(container, gameTask);
		};
	}
}());