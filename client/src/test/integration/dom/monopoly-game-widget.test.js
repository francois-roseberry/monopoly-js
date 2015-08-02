(function() {
	"use strict";
	
	var MonopolyGameWidget = require('./monopoly-game-widget');
	var MonopolyGameTask = require('./monopoly-game-task');
	
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A Monopoly game widget', function (domContext) {
		beforeEach(function () {
			var task = MonopolyGameTask.start();
			MonopolyGameWidget.render(domContext.rootElement, task);
		});
		
		it('renders the game configuration widget in the given container ' +
			'when its game task send the configuring status', function () {
				domContext.assertOneOf('.monopoly-game-configuration');
			});
	});
}());