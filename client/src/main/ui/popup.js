(function () {
    'use strict';

    var precondition = require('./contract').precondition;

    exports.render = function (container, positioning) {
        precondition(container, "A popup require a positionned container to render into");
        // Example : top + height + left + width, OR top + bottom + left + width, and so forth
        precondition(isFullyPositioned(positioning), "The popup must be fully positioned vertically and horizontally");

        var htmlElements = renderDom(container, positioning);
        var closedSubject = bindEvents(htmlElements);

        return externalInterface(htmlElements, closedSubject);
    };

    function isFullyPositioned(positioning) {
        var cssAttributes = _.keys(positioning);
        var heightAttributes = ["top", "bottom", "height"];
        var widthAttributes = ["left", "width", "right"];

        return cssAttributes.length === 4 &&
            _.intersection(cssAttributes, heightAttributes).length === 2 &&
            _.intersection(cssAttributes, widthAttributes).length === 2;
    }

    function renderDom(container, positioning) {
        var popupElement = d3.select(container[0])
            .append('div')
            .classed('popup', true)
            // The CSS classes are not accessible in the test so we set the position in javascript
            .style('position', 'absolute')
            .style(positioning);

        var closeButton = popupElement.append('button')
            .classed('popup-close-btn', true)
            .attr('data-ui', 'popup-close');
			
		closeButton.append('span')
			.classed({
				'glyphicon': true,
				'glyphicon-remove': true
			});

        var contentContainer = popupElement.append('div')
            .classed('popup-content', true);

        return {
            popupElement: popupElement,
            closeButton: closeButton,
            contentContainer: contentContainer
        };
    }

    function bindEvents(htmlElements) {
        var closedSubject = new Rx.AsyncSubject();

        htmlElements.closeButton.on('click', function () {
            closePopup(htmlElements, closedSubject);
        });

        return closedSubject;
    }

    function externalInterface(htmlElements, closedSubject) {
        return {
            contentContainer: function () {
                return $(htmlElements.contentContainer[0]);
            },

            closed: function () {
                return closedSubject.asObservable();
            },

            close: function () {
                closePopup(htmlElements, closedSubject);
            }
        };
    }

    function closePopup(htmlElement, closedSubject) {
        htmlElement.popupElement.classed('.popup-closing', true);
        htmlElement.popupElement.remove();
        closedSubject.onNext(true);
        closedSubject.onCompleted();
    }
}());