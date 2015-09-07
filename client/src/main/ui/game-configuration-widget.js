(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, configureGameTask) {
		precondition(container, 'Game configuration widget requires container to render into');
		precondition(configureGameTask, 'Game configuration widget requires a ConfigureGameTask');
		
		var panel = d3.select(container[0])
			.append('div')
			.classed('monopoly-game-configuration', true);
			
		panel.append('h1').text(i18n.CONFIGURE_GAME_TITLE);
		
		var computerPlayersBox = panel.append('div');
		computerPlayersBox.append('span').text(i18n.COMPUTER_PLAYERS_LABEL + ' : ');
		computerPlayersBox.append('input').classed('computer-players', true);
		var spinner = $('.computer-players');
		spinner.spinner({ min: 1, max: 7 });
		configureGameTask.players().take(1).subscribe(function (players) {
			spinner.spinner('value', players.length - 1);
			spinner.on('spinchange', function (event) {
				configureGameTask.setComputers(spinner.spinner('value'));
			});
		});
		
		panel.append('button')
			.classed('btn-start-game', true)
			.text(i18n.BUTTON_START_GAME)
			.on('click', function () {
				configureGameTask.startGame();
			});
	};
}());