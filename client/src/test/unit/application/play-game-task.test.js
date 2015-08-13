(function() {
	"use strict";
	
	var PlayGameTask = require('./play-game-task');
	var Board = require('./board');
	var PlayerColors = require('./player-colors').colors();
	
	var testPlayers = require('./test-players');
	
	describe('The PlayGame task', function () {
		var task;
		
		beforeEach(function () {
			task = PlayGameTask.start(Board.SQUARES, testPlayers.PLAYERS);
		});
		
		it('at start, sends an event with the roll-dice choice', function (done) {
			task.choices().take(1).subscribe(function (choices) {
				expect(choices).to.eql(['roll-dice']);
			}, done, done);
		});
		
		it('at start, sends an event with the initial game state', function (done) {
			task.gameState().take(1).subscribe(function (state) {
				expect(state.squares).to.eql(Board.SQUARES);
				expect(state.players.length).to.eql(testPlayers.PLAYERS.length);
				_.each(state.players, function (player, index) {
					expect(player.name).to.eql('Joueur ' + (index + 1));
					expect(player.money).to.eql(1500);
					expect(player.position).to.eql(0);
					expect(player.color).to.eql(PlayerColors[index]);
				});
			}, done, done);
		});
		
		it('stopping the task sends an event', function (done) {
			task.stop();
			
			task.completed().subscribe(_.noop, done, done);
		});
	});
}());