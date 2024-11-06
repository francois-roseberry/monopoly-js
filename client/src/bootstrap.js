(function() {
	"use strict";
	
	var GameTask = require('@app/game-task');
	var GameWidget = require('@ui/game-widget');
	
	var failFast = require('@infrastructure/fail-fast');
	
	failFast.crashOnUnhandledException();
    	failFast.crashOnResourceLoadingError();

	$(document).ready(startApplication());

	function startApplication() {
		var container = $('.game-container');

		var task = GameTask.start();
		GameWidget.render(container, task);
	}
}());

