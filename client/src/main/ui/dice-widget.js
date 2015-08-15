(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, rollDiceTask) {
		precondition(container, 'Dice Widget requires a container to render into');
		precondition(rollDiceTask, 'Dice Widget requires a RollDiceTask');
		
		var diceContainer = d3.select(container[0])
			.append('div')
			.classed('dice-container', true);
			
		rollDiceTask.diceRolled().subscribe(function (dice) {
			diceContainer.selectAll('.die')
				.data(dice)
				.enter()
				.append('div')
				.classed('die', true)
				.append('svg')
				.attr({
					'width': 60,
					'height': 60
				})
				.append('circle')
				.attr({
					fill: 'black',
					cx: 30,
					cy: 30,
					r: 3
				});
		});
	};
}());