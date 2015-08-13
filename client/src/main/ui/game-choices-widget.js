(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.render = function(container, playGameTask) {
		precondition(container, 'The game choices widget requires a container to render into');
		precondition(playGameTask, 'The game choices widget requires a PlayGameTask');
		
	};
}());