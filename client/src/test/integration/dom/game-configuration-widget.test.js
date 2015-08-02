(function() {
	"use strict";
	
	var GameConfigurationWidget = require('./game-configuration-widget');
	
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A game configuration widget', function (domContext) {
		beforeEach(function () {
			GameConfigurationWidget.render(domContext.rootElement);
		});
		
		it('is rendered in the given container', function () {
			domContext.assertOneOf('.monopoly-game-configuration');
		});
		
		it('displays the title', function () {
			domContext.assertText('h1', 'Monopoly game configuration');
		});
		
		it('displays the start game button', function () {
			domContext.assertOneOf('button');
			domContext.assertText('button', 'Start game');
		});
	});
}());