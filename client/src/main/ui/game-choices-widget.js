(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.render = function(container, playGameTask) {
		precondition(container, 'The game choices widget requires a container to render into');
		precondition(playGameTask, 'The game choices widget requires a PlayGameTask');
		
		var choicesContainer = d3.select(container[0])
			.append('div')
			.classed('monopoly-game-choices', true);
		
		playGameTask.choices().subscribe(function (choices) {
			var choiceButtons = choicesContainer
				.selectAll('.monopoly-game-choices-item')
				.data(choices);
				
			choiceButtons
				.enter()
				.append('button')
				.classed('monopoly-game-choices-item', true)
				.attr('data-id', function (choice) {
					return choice.id;
				})
				.text(function (choice) {
					return choice.name;
				})
				.on('click', function (choice) {
					playGameTask.makeChoice(choice);
				});
				
			choiceButtons
				.exit()
				.remove();
		});
	};
}());