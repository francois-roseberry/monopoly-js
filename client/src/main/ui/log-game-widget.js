(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.render = function (container, messages) {
		precondition(container, 'LogGame widget requires a container to render into');
		precondition(messages, 'LogGame widget requies a messages observable');
		
		var console = d3.select(container[0])
			.append('div')
			.classed('game-log-console', true);
			
		messages.subscribe(function (log) {
			console.insert('p', '.game-log-message')
				.classed('game-log-message', true)
				.html(log.message())
				.style('opacity', 0)
				.transition().duration(600).style("opacity", 1);
		});
	};
}());