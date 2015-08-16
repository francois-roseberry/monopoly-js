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
			var diceSelection = diceContainer.selectAll('.die')
				.data(dice);
				
			diceSelection
				.enter()
				.append('div')
				.classed('die', true)
				.append('svg')
				.attr({
					'width': 60,
					'height': 60
				});
				
			diceSelection
				.select('svg')
				.html(function (die) {
					return dieRepresentation(die);
				});
				
		}, _.noop, function () {
			diceContainer.remove();
		});
	};
	
	function dieRepresentation(value) {
		if (value === 6) {
			return dot(15, 15) + dot(30, 15) + dot(45, 15) +
				dot(15, 45) + dot(30, 45) + dot(45, 45);
		}
		
		if (value === 5) {
			return dot(15, 15) + dot(45, 15) + dot(30, 30) +
				dot(15, 45) + dot(45, 45);
		}
		
		if (value === 4) {
			return dot(20, 20) + dot(40, 20) + dot(20, 40) +
				dot(40, 40);
		}
		
		if (value === 3) {
			return dot(15, 30) + dot(30, 30) + dot(45, 30);
		}
		
		if (value === 2) {
			return dot(20, 30) + dot(40, 30);
		}
		
		return dot(30, 30);
	}
	
	function dot(x, y) {
		return "<circle fill='black' r=5 cx=" + x + " cy=" + y + " />";
	}
}());