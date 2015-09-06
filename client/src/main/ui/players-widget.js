(function() {
	"use strict";
	
	var precondition =  require('./contract').precondition;
	var i18n = require('./i18n');
	
	var groupColors = require('./group-colors').color;
	
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
				.data(state.players());
				
			createPlayerPanels(panelSelection);
			updatePlayerPanels(panelSelection, state);
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
			.classed('player-money', true);
			
		panels.append('div')
			.classed('player-properties', true);
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
			.text(function (player) {
				return i18n.formatPrice(player.money());
			});
			
		var playerPropertiesSelection = selection
			.select('.player-properties')
			.selectAll('.player-property')
			.data(function (player) {
				return player.properties();
			});
			
		createPlayerProperties(playerPropertiesSelection, state);
	}
	
	function createPlayerProperties(selection, state) {
		selection.enter()
			.append('div')
			.classed('player-property', true)
			.attr('data-ui', function (propertyId) {
				return propertyId; 
			})
			.text(function (propertyId) {
				return nameOfProperty(state, propertyId);
			})
			.style('background-color', function (propertyId) {
				return colorOfProperty(state, propertyId);
			});
	}
	
	function nameOfProperty(state, propertyId) {
		var property = state.propertyById(propertyId);
		return property.match({
			'estate': function (id, name, price, group) {
				return name;
			},
			'railroad': function (id, name, price) {
				return name;
			},
			'company': function (id, name, price) {
				return name;
			},
			_: _.noop
		});
	}
	
	function colorOfProperty(state, propertyId) {
		var property = state.propertyById(propertyId);
		return property.match({
			'estate': function (id, name, price, group) {
				return groupColors(group);
			},
			'railroad': function (id, name, price) {
				return 'black';
			},
			'company': function (id, name, price) {
				return 'lightgreen';
			},
			_: _.noop
		});
	}
}());