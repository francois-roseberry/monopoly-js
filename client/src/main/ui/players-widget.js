(function() {
	"use strict";
	
	var precondition =  require('./contract').precondition;
	var i18n = require('./i18n');
	
	exports.render = function (container, gameState) {
		precondition(container, 'Players widget requires a container to render into');
		precondition(gameState, 'Players widget requires an observable of the gameState');
		
		var panel = d3.select(container[0])
			.append('div')
			.classed('monopoly-players', true);
			
		gameState.subscribe(renderPlayerPanels(panel));
	};
	
	function renderPlayerPanels(container) {
		return function (state) {
			var panels = container.selectAll('.player-panel')
				.data(state.players)
				.enter()
				.append('div')
				.classed('player-panel', true);
				
			panels
				.append('svg')
				.attr({
					width: 12,
					height: 12
				})
				.classed('player-panel-token', true)
				.append('circle')
				.attr({
					cx: 6,
					cy: 6,
					r: 6,
					fill: function (player) {
						return player.color;
					}
				});
				
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
					return i18n.formatPrice(player.money);
				});
		};
	}
}());