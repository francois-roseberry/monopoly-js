(function() {
	"use strict";
	
	var PlayGameTask = require('./play-game-task');
	var MoveChoice = require('./move-choice');
	var FinishTurnChoice = require('./finish-turn-choice');
	
	var testData = require('./test-data');
	var assert = require('./assert');
	
	describe('A HandleChoicesTask', function () {
		var playGameTask;
		var task;
		var currentChoices;
		var currentHumanChoices;
		var actionMade;
		
		beforeEach(function () {
			playGameTask = PlayGameTask.start(testData.gameConfiguration());
			task = playGameTask.handleChoicesTask();
			
			playGameTask.gameState()
				.map(onlyChoices)
				.subscribe(function (choices) {
					currentChoices = choices;
				});
				
			task.choices()
				.subscribe(function (choices) {
					currentHumanChoices = choices;
				});
				
			task.choiceMade()
				.subscribe(function (action) {
					actionMade = action;
				});
		});
		
		it('sends the choices event when its playGameTask sends game state for a human player',
			function () {
				expect(toChoiceIds(currentHumanChoices)).to.eql(toChoiceIds(currentChoices));
			});
			
		it('does not send the choices event when its playGameTask sends choices for a computer player',
			function () {
				switchTurnToComputerPlayer();
				
				expect(currentHumanChoices).to.eql([]);
			});
			
		it('sends a choiceMade event when a choice is made', function () {
			var arg = 2;
			
			task.makeChoice(MoveChoice.newChoice(), arg);
			
			expect(actionMade.choice.id).to.eql(MoveChoice.newChoice().id);
			expect(actionMade.arg).to.eql(arg);
		});
		
		it('sends an empty choices event to the human player when it makes a choice', function () {
			task.makeChoice(MoveChoice.newChoice());
			
			expect(currentHumanChoices).to.eql([]);
		});
		
		it('stop correctly', function () {
			assert.taskStopCorrectlyOnEvent(task, [
				task.choices(),
				task.choiceMade(),
				task.completed()
			], function () {
				task.stop();
			});
		});
		
		function switchTurnToComputerPlayer() {
			task.makeChoice(FinishTurnChoice.newChoice());
		}
		
		function toChoiceIds(choices) {
			return _.map(choices, function (choice) {
					return choice.id;
				});
		}
		
		function onlyChoices(state) {
			return state.choices();
		}
	});
}());