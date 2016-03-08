(function() {
	"use strict";
	
	var GameTask = require('./game-task');
	var GameWidget = require('./game-widget');
	
	var failFast = require('./fail-fast');
	
	failFast.crashOnUnhandledException();
    	failFast.crashOnResourceLoadingError();

	$(document).ready(startApplication());

	function startApplication() {
		var container = $('.game-container');

		var task = GameTask.start();
		GameWidget.render(container, task);
	}
}());

