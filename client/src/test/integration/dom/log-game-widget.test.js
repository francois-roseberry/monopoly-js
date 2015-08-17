(function() {
	"use strict";
	
	var LogGameWidget = require('./log-game-widget');
	
	var describeInDom = require('./dom-fixture').describeInDom;
	
	describeInDom('A LogGameWidget', function (domContext) {
		var messages;
		
		beforeEach(function () {
			messages = new Rx.Subject();
			LogGameWidget.render(domContext.rootElement, messages);
		});
		
		it('is rendered in the given div', function () {
			domContext.assertOneOf('.game-log-console');
		});
		
		it('appends each message from the observable', function () {
			messages.onNext('A message');
			
			domContext.assertOneOf('.game-log-message');
		});
	});
}());