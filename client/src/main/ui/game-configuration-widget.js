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
		
		var slotsContainer = panel.append('div').classed('player-slots', true);
		
		var activeSlotsContainer = slotsContainer.append('div')
			.classed('active-player-slots', true);
		
		var emptyBlock = slotsContainer.append('div')
			.classed({
				'player-slot': true,
				'empty-slot': true
			});
			
		emptyBlock.append('button')
			.classed('empty-slot-btn', true)
			.text(i18n.BUTTON_ADD_PLAYER)
			.on('click', function () {
				configureGameTask.addPlayerSlot();
			});
			
		configureGameTask.canAddPlayerSlot()
			.takeUntil(configureGameTask.completed())
			.subscribe(function (canAdd) {
				emptyBlock.style('display', (canAdd ? null : 'none'));
			});
		
		
		configureGameTask.playerSlots()
			.takeUntil(configureGameTask.completed())
			.subscribe(function (slots) {
				var slotsSelection = activeSlotsContainer
					.selectAll('.player-slot')
					.data(slots);
					
				createNewSlots(slotsSelection, configureGameTask);
				updateSlots(slotsSelection);
				removeUnneededSlots(slotsSelection);
			});
		
		var startButton = panel.append('button')
			.classed('btn-start-game', true)
			.text(i18n.BUTTON_START_GAME)
			.on('click', function () {
				configureGameTask.startGame();
			});
			
		configureGameTask.configurationValid()
			.takeUntil(configureGameTask.completed())
			.subscribe(function (valid) {
				startButton.attr('disabled', (valid ? null : 'disabled'));
			});
	};
	
	function createNewSlots(selection, configureGameTask) {
		var newSlot = selection.enter()
			.append('div')
			.classed('player-slot', true);
			
		newSlot.append('div')
			.classed('player-type-label', true);
			
		newSlot.append('div')
			.classed('remove-player-slot-btn', true)
			.on('click', function () {
				configureGameTask.removePlayerSlot();
			})
			.append('span')
			.classed({
				'glyphicon': true,
				'glyphicon-minus-sign': true
			});
	}
	
	function updateSlots(selection) {
		selection.select('.player-type-label')
			.text(function (slot) {
				return (slot.type === 'human' ? i18n.PLAYER_TYPE_HUMAN : i18n.PLAYER_TYPE_COMPUTER);
			});
	}
	
	function removeUnneededSlots(selection) {
		selection.exit().remove();
	}
}());