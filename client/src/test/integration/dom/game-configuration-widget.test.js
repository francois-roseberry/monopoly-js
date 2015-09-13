(function() {
	"use strict";
	
	var GameConfigurationWidget = require('./game-configuration-widget');
	var ConfigureGameTask = require('./configure-game-task');
	
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A game configuration widget', function (domContext) {
		var task;
		
		beforeEach(function () {
			task = ConfigureGameTask.start();
			GameConfigurationWidget.render(domContext.rootElement, task);
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
		
		it('clicking to add a player sends an event in the underlying task', function (done) {
			task.playerSlots().skip(1).take(1).subscribe(_.noop, done, done);
			
			domContext.d3.clickOn('.empty-slot-btn');
		});
		
		it('hides the empty slot when cannot add player', function () {
			domContext.d3.clickOn('.empty-slot-btn');
			domContext.d3.clickOn('.empty-slot-btn');
			domContext.d3.clickOn('.empty-slot-btn');
			domContext.d3.clickOn('.empty-slot-btn');
			domContext.d3.clickOn('.empty-slot-btn');
			
			domContext.assertHidden('.player-slot.empty-slot');
		});
		
		it('renders the start game button', function () {
			domContext.assertOneOf('.btn-start-game');
			
			domContext.assertIsNotDisabled('.btn-start-game');
		});
		
		it('disable the start game button when there are not enough players', function () {
			domContext.d3.clickOn('.remove-player-slot-btn');
			
			domContext.assertIsDisabled('.btn-start-game');
		});
		
		it('clicking the start game button completes the game configuration task', function (done) {
			domContext.clickOn('.btn-start-game');
			
			task.completed().subscribe(_.noop, done, done);
		});
	});
}());