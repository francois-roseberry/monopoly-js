(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, gameTask) {
		precondition(container, 'Game configuration widget requires container to render into');
		precondition(gameTask, 'Game configuration widget requires a game task');
		
		var panel = d3.select(container[0])
			.append('div')
			.classed('monopoly-game-configuration', true);
			
		panel.append('h1').text('Monopoly - configuration de partie');
		
		var computerPlayersBox = panel.append('div');
		computerPlayersBox.append('span').text('Joueurs IA : ');
		computerPlayersBox.append('input').classed('computer-players', true);
		var spinner = $('.computer-players');
		spinner.spinner({ min: 1, max: 7 });
		spinner.spinner('value', 1);
		
		panel.append('button').text('Commencer la partie')
			.on('click', function () {
				gameTask.startGame(players(spinner.spinner('value')));
			});
	};
	
	function players(computers) {
		var allPlayers = [{}];
		for (var i = 0; i < computers; i++) {
			allPlayers.push({});
		}
		return allPlayers;
	}
}());