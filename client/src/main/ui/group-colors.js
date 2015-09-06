(function() {
	"use strict";
	
	var precondition = require('./contract').precondition;
	
	exports.color = function (groupIndex) {
		var colors = ['midnightblue', 'lightskyblue', 'mediumvioletred', 'orange', 'red', 'yellow', 'green', 'blue'];
		
		precondition(colors[groupIndex], 'No color has been defined for group ' + groupIndex);
		
		return colors[groupIndex];
	};
}());