(function() {
	"use strict";
	
	var BoardWidget = require('./board-widget');
	var DiceWidget = require('./dice-widget');
	var GameChoicesWidget = require('./game-choices-widget');
	var PlayersWidget = require('./players-widget');
	var LogGameWidget = require('./log-game-widget');
	var TradeWidget = require('./trade-widget');
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, playGameTask) {
		precondition(container, 'A Monopoly game widget requires a container to render into');
		precondition(playGameTask, 'A Monopoly game widget requires a game task');
		
		var panel = d3.select(container[0])
			.append('div')
			.classed('monopoly-game', true);
			
		var centralComponentsContainer = panel.append('div')
			.classed('monopoly-central-components', true);
			
		centralComponentsContainer.append('button')
			.attr('id', 'new-game-button')
			.classed({
				'btn': true,
				'btn-default': true
			})
			.text(i18n.BUTTON_NEW_GAME)
			.on('click', function() {
				playGameTask.stop();
			});
		
		GameChoicesWidget.render($(centralComponentsContainer[0]), playGameTask.handleChoicesTask());
		LogGameWidget.render($(centralComponentsContainer[0]), playGameTask.messages());
		BoardWidget.render($(panel[0]), playGameTask.gameState().takeUntil(playGameTask.completed()));
		PlayersWidget.render($(panel[0]), playGameTask.gameState().takeUntil(playGameTask.completed()));
		
		playGameTask.rollDiceTaskCreated().subscribe(function (task) {
			DiceWidget.render($(centralComponentsContainer[0]), task);
		});
		
		playGameTask.tradeTaskCreated().subscribe(function (task) {
			TradeWidget.render($(centralComponentsContainer[0]), task);
		});
	};
}());
