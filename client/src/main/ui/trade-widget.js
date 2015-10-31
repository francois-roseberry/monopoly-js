(function() {
	"use strict";

	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, tradeTask) {
		precondition(container, 'A TradeWidget requires a container to render into');
		precondition(tradeTask, 'A Tradewidget requires a TradeTask');
		
		var panel = d3.select(container[0])
			.append('div')
			.classed('monopoly-trade-panel', true);
			
		panel.append('span')
			.classed('monopoly-trade-title', true)
			.text(i18n.TRADE_TITLE);
			
		var panelContainer = panel.append('div')
			.classed('monopoly-trade-player-panels', true);
		
		renderPlayerPanel(panelContainer, tradeTask.currentPlayer(), tradeTask);
		renderPlayerPanel(panelContainer, tradeTask.otherPlayer(), tradeTask);
	};
	
	function renderPlayerPanel(container, player, tradeTask) {
		var panel = container.append('div')
			.classed('monopoly-trade-player-panel', true)
			.attr('data-ui', player.id());
			
		panel.append('span')
			.classed('monopoly-trade-player-name', true)
			.text(player.name());
			
		var list = panel.append('div')
			.classed('monopoly-trade-player-properties', true);
			
		tradeTask.selectedProperties().subscribe(function (selectedProperties) {
			var items = list.selectAll('.monopoly-trade-player-property')
				.data(player.properties());
				
			items.enter()
				.append('button')
				.classed('monopoly-trade-player-property', true)
				.text(function (property) {
					return property.name();
				})
				.style('background-color', function (property) {
					return property.group().color();
				})
				.on('click', function (property) {
					tradeTask.togglePropertySelection(property.id());
				});
				
			items.classed('monopoly-trade-player-property-selected', function (property) {
				return _.contains(selectedProperties, property.id());
			});
		});
		
		panel.append('input')
			.attr('type', 'text')
			.classed('monopoly-trade-player-money-spinner', true)
			.each(function () {
				$(this).spinner({
					min: 0, max: player.money(), step: 1
				})
				.val(0);
			});
			
		panel.append('span')
			.classed('monopoly-trade-player-money-total', true)
			.text('/ ' + i18n.formatPrice(player.money()));
	}
}());
