(function() {
	"use strict";
	
	var BoardWidget = require('./board-widget');
	
	var describeInDom = require('./dom-fixture').describeInDom;
		
	describeInDom('A Board Widget', function (domContext) {
		beforeEach(function () {
			BoardWidget.render(domContext.rootElement);
		});
		
		it('is rendered in the correct div', function () {
			domContext.assertOneOf('.monopoly-board');
		});
	});
}());