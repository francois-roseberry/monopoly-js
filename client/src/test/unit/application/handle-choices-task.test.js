(function() {
	"use strict";
	
	var PlayGameTask = require('./play-game-task');
	var HandleChoicesTask = require('./handle-choices-task');
	var MoveChoice = require('./move-choice');
	var FinishTurnChoice = require('./finish-turn-choice');
	
	var testData = require('./test-data');
	
	describe('A HandleChoicesTask', function () {
		var playGameTask;
		var task;
		
		beforeEach(function () {
			playGameTask = PlayGameTask.start(testData.gameConfiguration());
			task = HandleChoicesTask.start(playGameTask);
		});
		
		it('sends the choices event when its playGameTask sends game state for a human player',
			function (done) {
				playGameTask.gameState().take(1)
					.map(onlyChoices)
					.subscribe(function (choices) {
						task.choices().take(1).subscribe(function (humanChoices) {
							expect(toChoiceIds(humanChoices)).to.eql(toChoiceIds(choices));
						}, done, done);
				});
			});
			
		it('does not send the choices event when its playGameTask sends choices for a computer player',
			function (done) {
				switchTurnToComputerPlayer();
				
				playGameTask.gameState().take(1)
					.map(onlyChoices)
					.subscribe(function () {
						task.choices().skip(1).subscribe(function () {
							throw new Error('Should never be called');
						});
				}, done, done);
			});
			
		it('sends a choiceMade event when a choice is made', function (done) {
			var arg = 2;
			task.choiceMade().take(1).subscribe(function (action) {
				expect(action.choice.id).to.eql(MoveChoice.newChoice().id);
				expect(action.arg).to.eql(arg);
			}, done, done);
			
			task.makeChoice(MoveChoice.newChoice(), arg);
		});
		
		it('sends an empty choices event to the human player when it makes a choice', function (done) {
			task.makeChoice(MoveChoice.newChoice());
			
			task.choices().take(1).subscribe(function (choices) {
				expect(choices).to.eql([]);
			}, done, done);
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