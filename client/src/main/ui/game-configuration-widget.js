(function() {
	"use strict";
	
	var i18n = require('./i18n').i18n();
	var precondition = require('./contract').precondition;
	
	var Popup = require('./popup');
	
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
			
		var emptyBlockButton = emptyBlock.append('button')
			.classed('empty-slot-btn', true)
			.text(i18n.BUTTON_ADD_PLAYER);
			
		emptyBlockButton
			.on('click', function () {
				var positionning = firstPlayerTypeOverEmptyBlock(emptyBlockButton, configureGameTask);
				var popup = Popup.render($(document.body), positionning);

				renderPlayerTypesList(popup, configureGameTask);
			});
			
		configureGameTask.canAddPlayerSlot()
			.subscribe(function (canAdd) {
				emptyBlock.style('display', (canAdd ? null : 'none'));
			});
		
		
		configureGameTask.playerSlots()
			.subscribe(function (slots) {
				var slotsSelection = activeSlotsContainer
					.selectAll('.player-slot')
					.data(slots);
					
				createNewSlots(slotsSelection, configureGameTask);
				updateSlots(slotsSelection);
				removeUnneededSlots(slotsSelection);
			});
		
		var startButton = panel.append('button')
			.classed({
				'btn-start-game': true,
				'btn': true,
				'btn-default': true
			})
			.text(i18n.BUTTON_START_GAME)
			.on('click', function () {
				configureGameTask.startGame();
			});
			
		configureGameTask.configurationValid()
			.subscribe(function (valid) {
				startButton.attr('disabled', (valid ? null : 'disabled'));
			});
	};
	
	function firstPlayerTypeOverEmptyBlock(emptyBlockButton, configureGameTask) {
        var buttonRectangle = emptyBlockButton.node().getBoundingClientRect();

        var availableTypes = configureGameTask.availablePlayerTypes();
        var totalChoiceHeight = totalPlayerTypesHeight(availableTypes);
        var popupHeaderHeight = 60;

        return {
            top: String(buttonRectangle.top - 60) + "px",
            left: String(buttonRectangle.left + 25) + "px",
            width: "250px",
            height: String(totalChoiceHeight + popupHeaderHeight) + "px"
        };
    }
	
	function totalPlayerTypesHeight(types) {
        var lineHeight = 32;
        var maxCharacterPerLines = 22;

        return types.map(function (type) {
            var lineCount = Math.ceil(type.length / maxCharacterPerLines);
            return lineCount * lineHeight;
        }).reduce(function (previous, current) {
            return previous + current;
        }, 0);
    }
	
	function renderPlayerTypesList(popup, configureGameTask) {
        var allTypes = configureGameTask.availablePlayerTypes();

        var typeItems = d3.select(popup.contentContainer()[0])
            .append("ul")
            .attr('data-ui', 'available-types')
            .classed('choice-list', true)
            .selectAll('li')
            .data(allTypes);

        var typeButtons = typeItems.enter()
            .append('li')
            .append('button')
            .classed('choice-btn', true)
            .attr({
                'data-ui': 'available-type-choice',
                'data-id': function (type) {
                    return type;
                }
            })
            .on('click', function (type) {
                configureGameTask.addPlayerSlot(type);
                popup.close();
            });

        typeButtons.append('span')
            .classed('choice-label', true)
            .text(function (type) {
                return type === 'human' ? i18n.PLAYER_TYPE_HUMAN : i18n.PLAYER_TYPE_COMPUTER;
            });
    }
	
	function createNewSlots(selection, configureGameTask) {
		var newSlot = selection.enter()
			.append('div')
			.classed('player-slot', true);
			
		newSlot.append('div')
			.classed('player-type-label', true);
			
		newSlot.append('div')
			.classed('remove-player-slot-btn', true)
			.on('click', function (_, index) {
				configureGameTask.removePlayerSlot(index);
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
			
		selection.select('.remove-player-slot-btn')
			.attr('data-index', function (_, index) {
				return index;
			});
	}
	
	function removeUnneededSlots(selection) {
		selection.exit().remove();
	}
}());