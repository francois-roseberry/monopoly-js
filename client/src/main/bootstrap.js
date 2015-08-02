(function() {
	"use strict";
	
	var MonopolyGameTask = require('./monopoly-game-task');
	var MonopolyGameWidget = require('./monopoly-game-widget');
	
	var failFast = require('./fail-fast');
	
	failFast.crashOnUnhandledException();
    failFast.crashOnResourceLoadingError();

	$(document).ready(startApplication());

	function startApplication() {
		var container = $('.game-container');

		var task = MonopolyGameTask.start();
		MonopolyGameWidget.render(container, task);
	}
}());

