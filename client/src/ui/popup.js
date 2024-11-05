(function () {
    'use strict';

    var precondition = require('./contract').precondition;

    exports.render = function (container, positioning, options) {
        precondition(container, "A popup require a positionned container to render into");
        // Example : top + height + left + width, OR top + bottom + left + width, and so forth
        precondition(isFullyPositioned(positioning), "The popup must be fully positioned vertically and horizontally");

		options = options || defaultOptions();
        var htmlElements = renderDom(container, positioning);
        var closedSubject = bindEvents(htmlElements.popupElement, options);

        return externalInterface(htmlElements, closedSubject);
    };
	
	function defaultOptions() {
		return {
			closeBtn : true
		};
	}

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

        var contentContainer = popupElement.append('div')
            .classed('popup-content', true);

        return {
            popupElement: popupElement,
            contentContainer: contentContainer
        };
    }

    function bindEvents(popupElement, options) {
		var closedSubject = new Rx.AsyncSubject();
		
		if (options.closeBtn) {
			var closeButton = popupElement.append('button')
				.classed('popup-close-btn', true)
				.attr('data-ui', 'popup-close')
				.on('click', function () {
					closePopup(popupElement, closedSubject);
				});
				
			closeButton.append('span')
				.classed({
					'glyphicon': true,
					'glyphicon-remove': true
				});
		}
        
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
                closePopup(htmlElements.popupElement, closedSubject);
            }
        };
    }

    function closePopup(popupElement, closedSubject) {
        popupElement.classed('.popup-closing', true);
        popupElement.remove();
        closedSubject.onNext(true);
        closedSubject.onCompleted();
    }
}());