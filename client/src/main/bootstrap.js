(function() {
	"use strict";
	
	var GameConfigurationWidget = require('./game-configuration-widget');
	
	var failFast = require('./fail-fast');
	
	failFast.crashOnUnhandledException();
    failFast.crashOnResourceLoadingError();

	$(document).ready(startApplication());

	function startApplication() {
		var container = $('.game-container');

		GameConfigurationWidget.render(container);
	}
}());

