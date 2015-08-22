(function() {
	"use strict";
	
	var i18n = require('./i18n');
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, gameTask) {
		precondition(container, 'Game configuration widget requires container to render into');
		precondition(gameTask, 'Game configuration widget requires a game task');
		
		var panel = d3.select(container[0])
			.append('div')
			.classed('monopoly-game-configuration', true);
			
		panel.append('h1').text(i18n.CONFIGURE_GAME_TITLE);
		
		var computerPlayersBox = panel.append('div');
		computerPlayersBox.append('span').text(i18n.COMPUTER_PLAYERS_LABEL + ' : ');
		computerPlayersBox.append('input').classed('computer-players', true);
		var spinner = $('.computer-players');
		spinner.spinner({ min: 1, max: 7 });
		spinner.spinner('value', 1);
		
		panel.append('button')
			.classed('btn-start-game', true)
			.text(i18n.BUTTON_START_GAME)
			.on('click', function () {
				gameTask.startGame(players(spinner.spinner('value')));
			});
	};
	
	function players(computers) {
		var allPlayers = [{ type: 'human' }];
		for (var i = 0; i < computers; i++) {
			allPlayers.push({ type: 'computer' });
		}
		return allPlayers;
	}
}());