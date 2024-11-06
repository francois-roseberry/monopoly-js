"use strict";
	
var LogGameWidget = require('@ui/log-game-widget');
var Messages = require('@domain/messages');

var describeInDom = require('@test/integration/dom/util/dom-fixture').describeInDom;

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
		messages.onNext(Messages.simpleLog());
		
		domContext.assertOneOf('.game-log-message');
	});
});
