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
			var panels = container.selectAll('.player-panel')
				.data(state.players())
				.enter()
				.append('div')
				.classed('player-panel', true)
				.attr('data-ui', function (player) {
					return player.id();
				});
				
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
				
			panels
				.append('span')
				.classed('player-name', true)
				.text(function (player) {
					return player.name();
				});
				
			panels
				.append('span')
				.classed('player-money', true);
				
			d3.selectAll('.player-money')
				.data(state.players())
				.text(function (player) {
					return i18n.formatPrice(player.money());
				});
				
			panels.append('div')
				.classed('player-properties', true);
				
			var playerProperties = d3.selectAll('.player-properties')
				.data(state.players())
				.selectAll('.player-property')
				.data(function (player) { return player.properties(); });
				
			playerProperties.enter()
				.append('div')
				.classed('player-property', true)
				.attr('data-ui', function (propertyId) { return propertyId; })
				.text(function (propertyId) {
					return nameOfProperty(state, propertyId);
				})
				.style('background-color', function (propertyId) {
					return colorOfProperty(state, propertyId);
				});
				
			playerProperties.exit().remove();
		};
	}
	
	function nameOfProperty(state, propertyId) {
		var property = state.propertyById(propertyId);
		return property.match({
			'estate': function (id, name, group, price) {
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
			'estate': function (id, name, group, price) {
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