(function() {
	"use strict";
	
	var precondition =  require('./contract').precondition;
	
	exports.render = function (container, players) {
		precondition(container, 'Players widget requires a container to render into');
		precondition(players, 'Players widget requires an observable of the list of players');
		
		var panel = d3.select(container[0])
			.append('div')
			.classed('monopoly-players', true);
			
		players.subscribe(renderPlayerPanels(panel));
	};
	
	function renderPlayerPanels(container) {
		return function (players) {
			var panels = container.selectAll('.player-panel')
				.data(players)
				.enter()
				.append('div')
				.classed('player-panel', true);
				
			panels
				.append('span')
				.classed('player-name', true)
				.text(function (player) {
					return player.name;
				});
				
			panels
				.append('span')
				.classed('player-money', true)
				.text(function (player) {
					return player.money + ' $';
				});
		};
	}
}());