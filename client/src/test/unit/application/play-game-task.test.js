(function() {
	"use strict";
	
	var PlayGameTask = require('./play-game-task');
	var Board = require('./board');
	
	var testPlayers = require('./test-players');
	
	describe('The PlayGame task', function () {
		var task;
		
		beforeEach(function () {
			task = PlayGameTask.start(Board.SQUARES, testPlayers.PLAYERS);
		});
		
		it('at start, sends an event with the list of squares', function (done) {
			task.squares().take(1).subscribe(function (squares) {
				expect(squares).to.eql(Board.SQUARES);
			}, done, done);
		});
		
		it('at start, sends an event with the list of players', function (done) {
			task.players().take(1).subscribe(function (players) {
				expect(players.length).to.eql(testPlayers.PLAYERS.length);
				_.each(players, function (player, index) {
					expect(player.name).to.eql('Joueur ' + (index + 1));
					expect(player.money).to.eql(1500);
				});
			}, done, done);
		});
		
		it('stopping the task sends an event', function (done) {
			task.stop();
			
			task.completed().subscribe(_.noop, done, done);
		});
	});
}());