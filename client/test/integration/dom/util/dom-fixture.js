(function () {
    'use strict';

    var addAssertions = require('./dom-assert').addAssertions;

    exports.describeInDom = function (message, testSuite) {
        describe("[DOM Test]", function () {

            var context = {
                body: {
                    remove: function (selector) {
                        $(document.body).find(selector).remove();
                    }
                }
            };

            before(function () {
                addAssertions(context);
            });

            beforeEach(function () {
                // Simulate a 1024x768 viewport
                context.rootElement = $('<div style="width: 960px; height: 720px; position: relative"></div>');
                $(document.body).append(context.rootElement);
            });

            describe(message, function() {
                testSuite(context);
            });

            afterEach(function () {
                context.rootElement.remove();

                // The root element must not be accessible beyond that point
                delete context.rootElement;
            });

            after(function () {
                $(document.body).empty();
            });
        });
    };
}());