(function () {
    'use strict';

    var Popup = require('./popup');

    var describeInDom = require('./dom-fixture').describeInDom;

    describeInDom('An HTML popup', function (domContext) {
        var positioning = {
            top: "10px",
            right: "20px",
            bottom: "30px",
            left: "40px"
        };

        var popup;

        beforeEach(function () {
            popup = Popup.render(domContext.rootElement, positioning);
        });

        it('renders itself at the defined absolute position', function () {
            domContext.assertOneOf(".popup");

            var popupElement = domContext.rootElement.find('.popup');
            _.each(positioning, function (value, property) {
                expect(popupElement.css(property)).to.be(value);
            });
        });

        it('gives access to a container to render inside the popup', function () {
            popup.contentContainer().append('<div class="test">TEST</div>');

            domContext.assertOneOf(".popup-content > .test");
        });

        it('closes itself when clicking the close button', function () {
            assertClosedWhen(function() {
                domContext.clickOn('[data-ui=popup-close]');
            });
        });

        it('can be closed programmatically', function () {
            assertClosedWhen(function () {
                popup.close();
            });
        });

        function assertClosedWhen(triggerCloseEvent) {
            var closed = false;

            popup.closed().last().subscribe(function () {
                closed = true;
            });

            triggerCloseEvent();

            expect(closed).to.be(true);
            domContext.assertNothingOf('.popup');
        }
    });
}());