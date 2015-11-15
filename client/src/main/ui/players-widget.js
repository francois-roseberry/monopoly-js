(function() {
	"use strict";
	
	var precondition =  require('./contract').precondition;
	var i18n = require('./i18n').i18n();
	
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
			var panelSelection = container.selectAll('.player-panel')
				.data(state.players(), function (player) {
					return player.id();
				});
				
			createPlayerPanels(panelSelection);
			updatePlayerPanels(panelSelection, state);
			removeUnneededPlayerPanels(panelSelection);
		};
	}
	
	function createPlayerPanels(selection) {
		var panels = selection
			.enter()
			.append('div')
			.classed('player-panel', true)
			.attr('data-ui', function (player) {
				return player.id();
			});
			
		createPlayerTokens(panels);
			
		panels
			.append('span')
			.classed('player-name', true)
			.text(function (player) {
				return player.name();
			});
			
		panels
			.append('span')
			.classed('player-money', true)
			.attr('data-ui', 0);
			
		panels.append('div')
			.classed('player-properties', true);
	}
	
	function removeUnneededPlayerPanels(selection) {
		selection.exit().remove();
	}
	
	function createPlayerTokens(panels) {
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
					return player.color();
				}
			});
	}
	
	function updatePlayerPanels(selection, state) {
		selection
			.select('.player-money')
			.attr('data-ui', function (player) {
				var element = d3.select(this);
				var previousMoney = element.attr('data-ui');
				if (previousMoney > player.money()) {
					element.style('color', 'red');
					element.transition().duration(700).style('color', 'black');
				} else if (previousMoney < player.money()) {
					element.style('color', 'forestgreen');
					element.transition().duration(700).style('color', 'black');
				}
				return player.money();
			})
			.text(function (player) {
				return i18n.formatPrice(player.money());
			});
			
		var playerPropertiesSelection = selection
			.select('.player-properties')
			.selectAll('.player-property')
			.data(function (player) {
				return player.properties();
			}, function (property) { return property.id(); });
			
		createPlayerProperties(playerPropertiesSelection, state);
	}
	
	function createPlayerProperties(selection, state) {
		selection.enter()
			.append('div')
			.classed('player-property', true)
			.attr('data-ui', function (property) {
				return property.id(); 
			})
			.text(function (property) {
				return property.name();
			})
			.style('background-color', function (property) {
				return property.group().color();
			});
			
		selection.order();
		
		selection.exit().remove();
	}
}());