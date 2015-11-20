(function() {
	"use strict";
	
	var GameConfigurationWidget = require('./game-configuration-widget');
	var ConfigureGameTask = require('./configure-game-task');
	
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A game configuration widget', function (domContext) {
		var task;
		var currentSlots;
		
		beforeEach(function () {
			task = ConfigureGameTask.start();
			GameConfigurationWidget.render(domContext.rootElement, task);
			
			task.playerSlots().subscribe(function (slots) {
				currentSlots = slots;
			});
		});
		
		it('is rendered in the given container', function () {
			domContext.assertOneOf('.monopoly-game-configuration');
		});
		
		it('renders the title', function () {
			domContext.assertOneOf('h1');
		});
		
		it('renders a player slots container', function () {
			domContext.assertOneOf('.player-slots');
		});
		
		it('renders an active player slots container', function () {
			domContext.assertOneOf('.active-player-slots');
		});
		
		it('renders a player slot for each player, plus one empty slot', function () {
			domContext.assertElementCount('.player-slot', 4);
		});
		
		it('renders an empty slot for adding a player', function () {
			domContext.assertOneOf('.player-slot.empty-slot');
			domContext.assertVisible('.player-slot.empty-slot');
		});
		
		describe('clicking the empty block', function () {
			beforeEach(function () {
				domContext.d3.clickOn('.empty-slot-btn');
			});
			
			afterEach(function () {
				domContext.body.remove('.popup');
			});
			
			it('displays a popup with the available player types', function () {
				domContext.body.assertOneOf('.popup [data-ui=available-types]');
				
				_.each(task.availablePlayerTypes(), function (type) {
                    domContext.body.assertOneOf(popupTypeChoiceFor(type));
                });
			});
			
			describe('clicking on a type choice in the popup', function () {
                var type;

                beforeEach(function () {
                    type = task.availablePlayerTypes()[0];

                    domContext.body.clickOn(popupTypeChoiceFor(type));
                });

                it('add a player slot with the type', function () {
					expect(currentSlots.length).to.eql(4);
					expect(currentSlots[3]).to.eql({ type: type });
                });

                it('close the popup', function () {
                    domContext.body.assertNothingOf('.popup');
                });
            });
			
			function popupTypeChoiceFor(type) {
                return '.popup [data-ui=available-type-choice][data-id=' + type + ']';
            }
		});
		
		it('hides the empty slot when cannot add player', function () {
			task.addPlayerSlot('computer');
			task.addPlayerSlot('computer');
			task.addPlayerSlot('computer');
			task.addPlayerSlot('computer');
			task.addPlayerSlot('computer');
			
			domContext.assertHidden('.player-slot.empty-slot');
		});
		
		it('renders the start game button', function () {
			domContext.assertOneOf('.btn-start-game');
			
			domContext.assertEnabled('.btn-start-game');
		});
		
		it('disable the start game button when the configuration is invalid', function () {
			domContext.d3.clickOn('.remove-player-slot-btn[data-index="0"]');
			
			domContext.assertDisabled('.btn-start-game');
		});
		
		it('clicking the start game button completes the game configuration task', function (done) {
			domContext.clickOn('.btn-start-game');
			
			task.playerSlots().subscribe(_.noop, done, done);
		});
	});
}());