(function() {
	"use strict";
	
	var Square = require('./square');
	var BoardWidget = require('./board-widget');
	
	var describeInDom = require('./dom-fixture').describeInDom;
		
	describeInDom('A Board Widget', function (domContext) {
		beforeEach(function () {
			BoardWidget.render(domContext.rootElement, Square.START_SQUARE);
		});
		
		it('is rendered in the correct div', function () {
			domContext.assertOneOf('.monopoly-board');
		});
		
		it('renders a square', function () {
			domContext.assertOneOf('.monopoly-square');
		});
	});
}());