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
			playGameTask = PlayGameTask.start(Board.SQUARES, testPlayers.PLAYERS, { fastDice: true });
			task = HandleChoicesTask.start(playGameTask);
		});
		
		it('sends the choices event when its playGameTask sends choices for a human player',
			function (done) {
				playGameTask.choices().take(1).subscribe(function (choices) {
					task.choices().take(1).subscribe(function (humanChoices) {
						expect(humanChoices).to.eql(choices);
					}, done, done);
				});
			});
			
		it('does not send the choices event when its playGameTask sends choices for a computer player',
			function (done) {
				switchTurnToComputerPlayer();
				
				playGameTask.choices().take(1).subscribe(function () {
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
		
		function switchTurnToComputerPlayer() {
			task.makeChoice(Choices.finishTurn());
		}
	});
}());