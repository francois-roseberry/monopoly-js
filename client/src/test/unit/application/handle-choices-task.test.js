(function() {
	"use strict";
	
	var PlayGameTask = require('./play-game-task');
	var HandleChoicesTask = require('./handle-choices-task');
	var Board = require('./board');
	var Choices = require('./choices');
	
	var testPlayers = require('./test-players');
	
	describe('A HandleChoicesTask', function () {
		var playGameTask;
		var task;
		
		beforeEach(function () {
			playGameTask = PlayGameTask.start(Board.squares(), testPlayers.PLAYERS, { fastDice: true });
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
						task.choices().skip(1).take(1).subscribe(function () {
							throw new Error('Should never be called');
						}, done, done);
					
					done();
				});
			});
			
		it('sends a choiceMade event when a choice is made', function (done) {
			task.choiceMade().take(1).subscribe(function (choice) {
				expect(choice.id).to.eql(Choices.rollDice().id);
			}, done, done);
			
			task.makeChoice(Choices.rollDice());
		});
		
		it('sends an empty choices event to the human player when it makes a choice', function (done) {
			task.makeChoice(Choices.rollDice());
			
			task.choices().take(1).subscribe(function (choices) {
				expect(choices).to.eql([]);
			}, done, done);
		});
		
		function switchTurnToComputerPlayer() {
			task.makeChoice(Choices.finishTurn());
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